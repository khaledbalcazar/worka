"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_COUNTRY, countryByCode, type Country } from "@/lib/countries";

// El país elegido vive en una cookie: estado externo a React. Leerlo en un
// useEffect y volcarlo con setState provoca un render en cascada en cada
// montaje (y es lo que marcaba el linter en tres pantallas distintas).
// useSyncExternalStore está hecho justo para esto: entrega el valor por
// defecto durante el render del servidor y el real en el cliente, sin efecto
// de por medio y sin desajuste de hidratación.

// La cookie no emite eventos: se lee una vez por montaje.
function subscribe() {
  return () => {};
}

function getSnapshot(): string {
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith("worka_country="))
      ?.split("=")[1] ?? ""
  );
}

function getServerSnapshot(): string {
  return "";
}

// Devuelve el país guardado en la cookie, o el por defecto si no hay ninguno.
export function useCountryCookie(): Country {
  const code = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return code ? countryByCode(code) : DEFAULT_COUNTRY;
}
