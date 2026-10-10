"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Bus, Clock, Home, MapPin, Wifi } from "lucide-react";
import type { JobWithCompany } from "@/lib/types";
import { cityCoords, commuteLabel, estimateCommute } from "@/lib/geo";
import EntityAvatar from "@/components/EntityAvatar";

const sameSpot = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];

type CityGroup = { city: string; coords: [number, number]; jobs: JobWithCompany[] };

// Mapa de vacantes por ciudad (OpenStreetMap + Leaflet). Cada burbuja junta
// las vacantes presenciales e híbridas de una ciudad; al tocarla, la lista
// muestra esas vacantes con sus líneas de colectivo y el viaje estimado desde
// la ciudad del candidato. Las remotas no tienen lugar en el mapa y se
// cuentan aparte.
export default function JobMap({
  jobs,
  homeCity,
  country = "py",
}: {
  jobs: JobWithCompany[];
  homeCity: string | null;
  country?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const fittedFor = useRef("");
  const [ready, setReady] = useState(0);

  const { groups, remote, unplaced } = useMemo(() => {
    const byCity = new Map<string, CityGroup>();
    let remote = 0;
    let unplaced = 0;
    for (const job of jobs) {
      if (job.modality === "Remoto") { remote++; continue; }
      const coords = cityCoords(job.company.location_city, job.company.country ?? country);
      if (!coords) { unplaced++; continue; }
      const key = job.company.location_city;
      const group = byCity.get(key) ?? { city: key, coords, jobs: [] };
      group.jobs.push(job);
      byCity.set(key, group);
    }
    const homeCoords = cityCoords(homeCity, country);
    const groups = [...byCity.values()].sort((a, b) => {
      // Primero la ciudad propia, después la más cercana.
      if (!homeCoords) return b.jobs.length - a.jobs.length;
      const da = Math.hypot(a.coords[0] - homeCoords[0], a.coords[1] - homeCoords[1]);
      const db = Math.hypot(b.coords[0] - homeCoords[0], b.coords[1] - homeCoords[1]);
      return da - db;
    });
    return { groups, remote, unplaced };
  }, [jobs, homeCity, country]);

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const selected = groups.find((g) => g.city === selectedCity) ?? groups[0] ?? null;
  const home = cityCoords(homeCity, country);

  // Crea el mapa una sola vez. Leaflet toca window, por eso se importa acá.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !container.current || map.current) return;
      const instance = L.map(container.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(instance);
      map.current = instance;
      layer.current = L.layerGroup().addTo(instance);
      setReady((n) => n + 1);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      layer.current = null;
    };
  }, []);

  // Dibuja las burbujas cada vez que cambian las vacantes o la selección.
  useEffect(() => {
    if (!map.current || !layer.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !map.current || !layer.current) return;
      layer.current.clearLayers();
      const points: [number, number][] = [];
      for (const g of groups) {
        const active = g.city === selected?.city;
        const isHome = !!home && sameSpot(g.coords, home);
        const marker = L.marker(g.coords, {
          zIndexOffset: active ? 1000 : 0,
          title: `${g.city}: ${g.jobs.length} ${g.jobs.length === 1 ? "vacante" : "vacantes"}`,
          keyboard: true,
          icon: L.divIcon({
            className: "",
            html: `<span class="job-map-pin${active ? " is-active" : ""}${isHome ? " is-home" : ""}">${g.jobs.length}</span>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          }),
        });
        marker.on("click", () => setSelectedCity(g.city));
        marker.addTo(layer.current);
        points.push(g.coords);
      }
      // La ciudad propia con vacantes ya lleva un anillo verde en su burbuja.
      if (home && !groups.some((g) => sameSpot(g.coords, home))) {
        L.marker(home, {
          title: `Tu ciudad: ${homeCity}`,
          interactive: false,
          icon: L.divIcon({ className: "", html: '<span class="job-map-home" aria-hidden="true"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }),
        }).addTo(layer.current);
        points.push(home);
      }
      // Encuadra solo cuando cambian las ciudades, no al elegir una burbuja.
      const fitKey = `${groups.map((g) => g.city).join("|")}#${homeCity ?? ""}`;
      if (fittedFor.current === fitKey) return;
      fittedFor.current = fitKey;
      if (points.length === 1) map.current.setView(points[0], 11);
      else if (points.length > 1) map.current.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 12 });
      else map.current.setView(cityCoords("Asunción", "py")!, 6);
    })();
    return () => { cancelled = true; };
    // `selected` cambia el color de la burbuja activa.
  }, [groups, selected?.city, home, homeCity, ready]);

  return (
    <div className="job-map-layout">
      <div className="job-map-panel">
        <div ref={container} className="job-map" role="region" aria-label="Mapa de vacantes por ciudad" />
        <p className="job-map-legend">
          {home && <span><span className="job-map-home is-inline" /> Tu ciudad ({homeCity}), con anillo verde</span>}
          <span>Cada burbuja es una ciudad con vacantes.</span>
          {remote > 0 && <span><Wifi size={12} /> {remote} {remote === 1 ? "remota" : "remotas"} fuera del mapa</span>}
          {unplaced > 0 && <span>{unplaced} sin ciudad ubicable</span>}
        </p>
      </div>

      <div className="job-map-list">
        {groups.length > 0 && (
          <div className="job-map-cities" role="tablist" aria-label="Ciudades con vacantes">
            {groups.map((g) => (
              <button
                key={g.city}
                role="tab"
                aria-selected={g.city === selected?.city}
                onClick={() => {
                  setSelectedCity(g.city);
                  map.current?.setView(g.coords, Math.max(map.current.getZoom(), 11));
                }}
              >
                {g.city} <b>{g.jobs.length}</b>
              </button>
            ))}
          </div>
        )}

        {selected ? (
          <section aria-live="polite">
            <h2 className="job-map-title">
              <MapPin size={16} /> {selected.jobs.length} {selected.jobs.length === 1 ? "vacante" : "vacantes"} en {selected.city}
            </h2>
            {(() => {
              const label = commuteLabel(estimateCommute(homeCity, selected.city, country));
              return label ? <p className="job-map-commute"><Clock size={14} /> {label}{label !== "En tu ciudad" && <span> · estimado por distancia</span>}</p> : null;
            })()}
            <ul className="job-map-jobs">
              {selected.jobs.map((job) => (
                <li key={job.id}>
                  <Link href={`/empleo/${job.id}`}>
                    <EntityAvatar url={job.company.logo_url} name={job.company.trade_name} className="li-logo" />
                    <span className="min-w-0 flex-1">
                      <strong>{job.title}</strong>
                      <small>{job.company.trade_name} · {job.modality}</small>
                      <em>{job.salary_range || "Salario no informado"}</em>
                      {job.nearby_transit && <span className="job-map-transit"><Bus size={12} /> {job.nearby_transit}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="job-empty">
            <Home size={28} />
            <h2>No hay vacantes para mostrar en el mapa</h2>
            <p>Probá con otros filtros o volvé a la lista.</p>
          </div>
        )}
      </div>
    </div>
  );
}
