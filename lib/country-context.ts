import "server-only";
import { cookies } from "next/headers";
import { countryByCode, DEFAULT_COUNTRY, type Country } from "./countries";

const COOKIE = "worka_country";

// País activo para el visitante. Se guarda en una cookie que setean las
// landings de país y el selector; por defecto, Paraguay (donde nació Worka).
export async function getActiveCountry(): Promise<Country> {
  const store = await cookies();
  const code = store.get(COOKIE)?.value;
  return code ? countryByCode(code) : DEFAULT_COUNTRY;
}

export async function setActiveCountryCookie(code: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, countryByCode(code).code, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
