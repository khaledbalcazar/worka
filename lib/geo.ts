import { PY_REGION_COORDS, findCity } from "@/lib/cities";

// Centro aproximado de cada ciudad donde opera Worka, para ubicar vacantes en
// el mapa y estimar el viaje. Las vacantes no guardan coordenadas propias,
// así que el mapa trabaja a nivel ciudad: nunca marca una dirección exacta.

type Coords = [number, number]; // [lat, lng]

const CITY_COORDS: Record<string, Record<string, Coords>> = {
  py: {
    "Asunción": [-25.2637, -57.5759],
    "Ciudad del Este": [-25.5097, -54.6111],
    "San Lorenzo": [-25.3397, -57.5089],
    "Luque": [-25.27, -57.4872],
    "Lambaré": [-25.3468, -57.6065],
    "Fernando de la Mora": [-25.32, -57.54],
    "Encarnación": [-27.3306, -55.8667],
    "Capiatá": [-25.3552, -57.4454],
    "Mariano Roque Alonso": [-25.2078, -57.5323],
    "Limpio": [-25.1661, -57.4856],
    "Ñemby": [-25.3949, -57.5357],
    "Villa Elisa": [-25.3676, -57.5928],
    "San Antonio": [-25.4214, -57.5472],
    "Itauguá": [-25.3925, -57.3544],
    "Areguá": [-25.3125, -57.3847],
    "Hernandarias": [-25.4056, -54.6383],
    "Presidente Franco": [-25.5333, -54.6167],
    "Pedro Juan Caballero": [-22.5472, -55.7333],
    "Coronel Oviedo": [-25.4478, -56.44],
    "Caaguazú": [-25.4667, -56.0167],
    "Villarrica": [-25.75, -56.4333],
    "Concepción": [-23.4064, -57.4344],
    "Itá": [-25.5, -57.3667],
    "Villeta": [-25.5, -57.5667],
    "Ypacaraí": [-25.4, -57.2833],
    "Ypané": [-25.45, -57.53],
    "Guarambaré": [-25.49, -57.455],
    "J. Augusto Saldívar": [-25.45, -57.45],
    "Nueva Italia": [-25.61, -57.47],
    "Minga Guazú": [-25.48, -54.81],
    "Santa Rita": [-25.79, -55.09],
    "Caacupé": [-25.3861, -57.1405],
    "San Bernardino": [-25.31, -57.3],
    "Piribebuy": [-25.46, -57.04],
    "Paraguarí": [-25.6208, -57.1464],
    "Carapeguá": [-25.8, -57.24],
    "San Juan Bautista": [-26.6694, -57.1456],
    "San Ignacio": [-26.89, -57.03],
    "Ayolas": [-27.39, -56.9],
    "Caazapá": [-26.1953, -56.3681],
    "Pilar": [-26.8597, -58.3006],
    "San Pedro de Ycuamandiyú": [-24.0917, -57.0833],
    "San Estanislao": [-24.65, -56.43],
    "Santa Rosa del Aguaray": [-23.82, -56.52],
    "Horqueta": [-23.34, -57.06],
    "Yby Yaú": [-22.97, -56.53],
    "Capitán Bado": [-23.27, -55.53],
    "Salto del Guairá": [-24.0633, -54.3069],
    "Curuguaty": [-24.47, -55.69],
    "Katueté": [-24.25, -54.76],
    "Villa Hayes": [-25.0933, -57.5236],
    "Benjamín Aceval": [-24.97, -57.57],
    "Filadelfia": [-22.35, -60.0333],
    "Loma Plata": [-22.38, -59.85],
    "Mariscal Estigarribia": [-22.03, -60.62],
    "Fuerte Olimpo": [-21.0417, -57.8731],
    "Hohenau": [-27.08, -55.75],
    "Obligado": [-27.05, -55.63],
    "Bella Vista": [-27.05, -55.58],
    "Cambyretá": [-27.3, -55.8],
    "Capitán Miranda": [-27.25, -55.79],
    "Coronel Bogado": [-27.17, -56.25],
    "Natalio": [-26.73, -55.13],
  },
  ar: {
    "Buenos Aires": [-34.6037, -58.3816],
    "Córdoba": [-31.4201, -64.1888],
    "Rosario": [-32.9442, -60.6505],
    "Mendoza": [-32.8895, -68.8458],
    "La Plata": [-34.9214, -57.9545],
    "Mar del Plata": [-38.0055, -57.5426],
    "San Miguel de Tucumán": [-26.8083, -65.2176],
    "Salta": [-24.7821, -65.4232],
  },
  mx: {
    "Ciudad de México": [19.4326, -99.1332],
    "Guadalajara": [20.6597, -103.3496],
    "Monterrey": [25.6866, -100.3161],
    "Puebla": [19.0414, -98.2063],
    "Tijuana": [32.5149, -117.0382],
    "León": [21.125, -101.686],
    "Querétaro": [20.5888, -100.3899],
    "Mérida": [20.9674, -89.5926],
  },
  co: {
    "Bogotá": [4.711, -74.0721],
    "Medellín": [6.2442, -75.5812],
    "Cali": [3.4516, -76.532],
    "Barranquilla": [10.9685, -74.7813],
    "Cartagena": [10.391, -75.4794],
    "Cúcuta": [7.8939, -72.5078],
    "Bucaramanga": [7.1193, -73.1227],
    "Pereira": [4.8133, -75.6961],
  },
  cl: {
    "Santiago": [-33.4489, -70.6693],
    "Valparaíso": [-33.0472, -71.6127],
    "Concepción": [-36.827, -73.0503],
    "La Serena": [-29.9027, -71.2519],
    "Antofagasta": [-23.6509, -70.3975],
    "Temuco": [-38.7359, -72.5904],
    "Rancagua": [-34.1708, -70.7444],
    "Iquique": [-20.2307, -70.1357],
  },
  bo: {
    "La Paz": [-16.4897, -68.1193],
    "Santa Cruz de la Sierra": [-17.7833, -63.1821],
    "Cochabamba": [-17.4139, -66.1653],
    "El Alto": [-16.5, -68.15],
    "Oruro": [-17.9667, -67.1167],
    "Sucre": [-19.0196, -65.2619],
    "Tarija": [-21.5355, -64.7296],
    "Potosí": [-19.5836, -65.7531],
  },
};

const norm = (v: string) =>
  v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export function cityCoords(city: string | null | undefined, country = "py"): Coords | null {
  if (!city) return null;
  const table = CITY_COORDS[country] ?? CITY_COORDS.py;
  const key = Object.keys(table).find((name) => norm(name) === norm(city));
  if (key) return table[key];
  // Distrito de Paraguay sin coordenadas propias: el centro de su departamento.
  if ((country ?? "py") === "py") {
    const entry = findCity("py", city);
    if (entry) return PY_REGION_COORDS[entry.region] ?? null;
  }
  return null;
}

// Distancia en línea recta, en km.
export function distanceKm(a: Coords, b: Coords): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export type Commute =
  | { kind: "same-city" }
  | { kind: "estimate"; minutes: number; km: number; mode: "colectivo" | "ómnibus" }
  | { kind: "unknown" };

// Estimación gruesa del viaje en transporte público entre dos ciudades. Usa
// la distancia en línea recta con un recargo por el trazado de las calles, la
// velocidad media de un colectivo urbano (~18 km/h con paradas) o de un
// ómnibus de larga distancia (~65 km/h), y la espera. Es una referencia para
// comparar vacantes, no un horario: el detalle de cada aviso abre Google Maps
// y Moovit con la ruta real.
export function estimateCommute(from: string | null | undefined, to: string, country = "py"): Commute {
  if (from && norm(from) === norm(to)) return { kind: "same-city" };
  const a = cityCoords(from, country);
  const b = cityCoords(to, country);
  if (!a || !b) return { kind: "unknown" };
  const straight = distanceKm(a, b);
  const urban = straight <= 45;
  // Las calles de ciudad rodean más que una ruta.
  const km = straight * (urban ? 1.3 : 1.15);
  const minutes = urban ? 10 + (km / 18) * 60 : 20 + (km / 65) * 60;
  return { kind: "estimate", minutes: Math.max(5, Math.round(minutes / 5) * 5), km: Math.round(km), mode: urban ? "colectivo" : "ómnibus" };
}

export function commuteLabel(c: Commute): string | null {
  if (c.kind === "same-city") return "En tu ciudad";
  if (c.kind === "unknown") return null;
  const h = Math.floor(c.minutes / 60);
  const m = c.minutes % 60;
  const time = h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
  return `≈ ${time} en ${c.mode} desde tu ciudad`;
}
