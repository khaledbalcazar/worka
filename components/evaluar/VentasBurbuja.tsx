"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MessageCircle, X } from "lucide-react";
import { ventasUrl } from "./VentasCta";

export const VENTAS_EMAIL = "evaluar@worka.click";

// Burbuja de contacto con ventas.
//
// Apunta al plan Corporativo, que es el único que no se compra solo: quien
// tiene cinco sucursales necesita hablar con alguien antes de decidir, y si
// no encuentra con quién, se va a otro lado.
//
// Dos decisiones sobre cuándo aparece. No sale de entrada: la burbuja que te
// salta encima apenas cargás la página es la que todo el mundo cierra sin
// leer. Espera a que la persona baje un poco, o sea a que haya mostrado algún
// interés. Y si la cierra, no vuelve a molestar en esa sesión — un cartel que
// reaparece deja de ser una oferta y pasa a ser una pelea.
export default function VentasBurbuja() {
  const [visible, setVisible] = useState(false);
  const [abierta, setAbierta] = useState(false);
  const [cerrada, setCerrada] = useState(false);

  useEffect(() => {
    // Si ya la cerró antes, no se programa nada y la burbuja nunca aparece.
    // Se resuelve sin tocar el estado: marcarlo acá seria un setState
    // sincronico dentro del efecto, que dispara un render en cascada.
    //
    // El acceso va en try/catch porque en ventana privada o con el
    // almacenamiento bloqueado lanza en vez de devolver null.
    let yaCerrada = false;
    try {
      yaCerrada = sessionStorage.getItem("worka_ventas_cerrada") === "1";
    } catch {
      /* sin almacenamiento: se comporta como si nunca la hubiera cerrado */
    }
    if (yaCerrada) return;

    const alBajar = () => {
      if (window.scrollY > 600) {
        setVisible(true);
        window.removeEventListener("scroll", alBajar);
      }
    };
    window.addEventListener("scroll", alBajar, { passive: true });
    // Y si no baja, aparece igual pasado un rato: alguien que se quedó leyendo
    // arriba también puede estar interesado.
    const t = setTimeout(() => setVisible(true), 18000);

    return () => {
      window.removeEventListener("scroll", alBajar);
      clearTimeout(t);
    };
  }, []);

  function cerrar() {
    setAbierta(false);
    setCerrada(true);
    try {
      sessionStorage.setItem("worka_ventas_cerrada", "1");
    } catch {
      /* nada que guardar: alcanza con el estado en memoria */
    }
  }

  if (cerrada || !visible) return null;

  return (
    <div className="fixed z-50 right-4 bottom-4 sm:right-6 sm:bottom-6 flex flex-col items-end gap-3">
      {abierta && (
        <div
          className="w-[min(340px,calc(100vw-2rem))] rounded-2xl overflow-hidden animate-rise"
          style={{
            background: "var(--nk-card)",
            border: "1px solid var(--nk-line-2)",
            boxShadow: "0 24px 60px rgba(0,0,0,.6)",
          }}
        >
          <div
            className="px-5 py-4 flex items-start justify-between gap-3"
            style={{
              background: "linear-gradient(150deg,var(--nk-band),#1d2048)",
              borderBottom: "1px solid var(--nk-line-2)",
            }}
          >
            <div>
              <p className="text-[17px] font-medium m-0">
                Hablá con el equipo
              </p>
              <p
                className="text-[12.5px] mt-0.5 m-0"
                style={{ color: "rgba(233,233,237,.6)" }}
              >
                Respondemos en el día
              </p>
            </div>
            <button
              onClick={cerrar}
              aria-label="Cerrar"
              className="shrink-0 p-1 -m-1"
              style={{ color: "rgba(233,233,237,.55)" }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                {["AS", "JM", "VR"].map((i) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded-full grid place-items-center text-[10.5px] font-medium"
                    style={{
                      background: "var(--nk-800)",
                      border: "1.5px solid var(--nk-card)",
                      color: "var(--nk-200)",
                    }}
                  >
                    {i}
                  </span>
                ))}
              </div>
              <span
                className="text-[13px]"
                style={{ color: "rgba(233,233,237,.6)" }}
              >
                Ventas de Worka Evaluar
              </span>
            </div>

            <p
              className="text-sm leading-relaxed m-0 mb-4"
              style={{ color: "rgba(233,233,237,.68)" }}
            >
              Si tenés más de tres búsquedas abiertas a la vez o trabajás con
              varias sucursales, el{" "}
              <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>
                plan Corporativo
              </strong>{" "}
              es para vos. Coordinamos una llamada sin costo.
            </p>

            <a
              href={ventasUrl(
                "Hola, quiero coordinar una llamada para conocer el plan Corporativo de Worka Evaluar."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="nk-cta w-full mb-2.5"
            >
              <CalendarDays size={15} />
              Coordinar una llamada
            </a>
            <a
              href={ventasUrl(
                "Hola, tengo una consulta sobre Worka Evaluar."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="nk-ghost w-full"
            >
              <MessageCircle size={15} />
              Escribir por WhatsApp
            </a>

            <p
              className="text-[12px] text-center mt-4 m-0"
              style={{ color: "rgba(233,233,237,.45)" }}
            >
              También por{" "}
              <a
                href={`mailto:${VENTAS_EMAIL}?subject=${encodeURIComponent("Consulta sobre Worka Evaluar")}`}
                style={{ color: "var(--nk-300)" }}
              >
                {VENTAS_EMAIL}
              </a>
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => (abierta ? cerrar() : setAbierta(true))}
        className="nk-cta shadow-lg"
        style={{
          background: abierta
            ? "var(--nk-card)"
            : "color-mix(in srgb, var(--color-accent) 18%, var(--nk-card))",
          boxShadow: "0 12px 32px rgba(0,0,0,.5)",
        }}
      >
        {abierta ? (
          <>
            <X size={16} /> Cerrar
          </>
        ) : (
          <>
            <MessageCircle size={16} /> Hablar con ventas
          </>
        )}
      </button>
    </div>
  );
}
