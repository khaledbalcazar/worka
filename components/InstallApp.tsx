"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

// Registra el service worker y ofrece instalar Worka en la pantalla de inicio.
//
// Android/Chrome avisan con `beforeinstallprompt` y permiten disparar el
// diálogo nativo. iOS no implementa nada de eso: ahí la única vía es
// "Compartir → Agregar a inicio", así que se explica con palabras. Sin ese
// caso aparte, la mitad de la gente (iPhone) nunca se entera de que la app
// se puede instalar.

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "worka_install_dismissed";

export default function InstallApp() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Solo en producción. En desarrollo los chunks de Next no llevan hash en
    // el nombre, así que la caché del service worker sirve código viejo y uno
    // termina depurando una versión que ya no existe.
    if (process.env.NODE_ENV !== "production") return;
    // El registro va después de la carga para no competir por ancho de banda
    // con la primera pantalla, que es lo que la persona está esperando.
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    // Ya instalada: no hay nada que ofrecer.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // Safari en iOS usa una propiedad propia, fuera del estándar.
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (standalone) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const isIos =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !/crios|fxios/i.test(navigator.userAgent);

    if (isIos) {
      // En microtarea: mostrarlo de forma síncrona dentro del efecto encadena
      // un render extra apenas carga la pantalla, que es justo cuando la
      // persona espera ver las vacantes.
      queueMicrotask(() => {
        setShowIosHint(true);
        setHidden(false);
      });
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setHidden(true);
    localStorage.setItem(DISMISSED_KEY, "1");
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setHidden(true);
  }

  if (hidden) return null;

  return (
    // Va por encima de la barra inferior y respeta el área segura del iPhone.
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden px-3 pb-[calc(4.5rem_+_env(safe-area-inset-bottom))] print:hidden">
      <div className="card shadow-lg p-3 flex items-center gap-3">
        <img
          src="/icon-192.png"
          alt=""
          className="w-11 h-11 rounded-xl shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary-dark">
            Instalá Worka en tu celular
          </p>
          {showIosHint ? (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 flex-wrap">
              Tocá <Share size={12} className="inline" /> Compartir y elegí
              &ldquo;Agregar a inicio&rdquo;.
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">
              Se abre como app, sin ocupar espacio.
            </p>
          )}
        </div>
        {!showIosHint && (
          <button onClick={install} className="btn-primary text-xs shrink-0 px-3">
            <Download size={14} /> Instalar
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Ahora no"
          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-gray-400 active:bg-surface"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
