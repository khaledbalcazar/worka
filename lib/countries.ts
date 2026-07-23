// Fuente de verdad de los países donde opera Worka.
// La app arrancó en Paraguay; este módulo permite extenderla a la región
// sin cablear ciudades/moneda/teléfono por todos lados.

export interface Country {
  code: string; // ISO-2 en minúscula, también la clave en la base
  slug: string; // lo que va en la URL: /argentina, /mexico…
  name: string; // "Argentina"
  demonym: string; // "argentinos"
  flag: string; // emoji
  currency: string; // símbolo corto para mostrar ("Gs", "$", "Bs")
  currencyCode: string; // ISO-4217 para el marcado (PYG, ARS…)
  currencyName: string; // "guaraní", "peso"… para frases tipo "sin pagar un guaraní"
  phonePrefix: string; // "+595"
  taxIdLabel: string; // cómo se llama el RUC en cada país
  cities: string[];
  // Parámetros para consultar los agentes externos en ese país.
  serpGl: string; // Google country code
  serpDomain: string; // google_domain
  joobleLocation: string; // texto de ubicación para Jooble
  default?: boolean;
}

export const COUNTRIES: Country[] = [
  {
    code: "py",
    slug: "paraguay",
    name: "Paraguay",
    demonym: "paraguayos",
    flag: "🇵🇾",
    currency: "Gs",
    currencyCode: "PYG",
    currencyName: "guaraní",
    phonePrefix: "+595",
    taxIdLabel: "RUC",
    cities: [
      "Asunción",
      "Ciudad del Este",
      "San Lorenzo",
      "Luque",
      "Lambaré",
      "Fernando de la Mora",
      "Encarnación",
      "Capiatá",
    ],
    serpGl: "py",
    serpDomain: "google.com.py",
    joobleLocation: "Paraguay",
    default: true,
  },
  {
    code: "ar",
    slug: "argentina",
    name: "Argentina",
    demonym: "argentinos",
    flag: "🇦🇷",
    currency: "$",
    currencyCode: "ARS",
    currencyName: "peso",
    phonePrefix: "+54",
    taxIdLabel: "CUIT",
    cities: [
      "Buenos Aires",
      "Córdoba",
      "Rosario",
      "Mendoza",
      "La Plata",
      "Mar del Plata",
      "San Miguel de Tucumán",
      "Salta",
    ],
    serpGl: "ar",
    serpDomain: "google.com.ar",
    joobleLocation: "Argentina",
  },
  {
    code: "mx",
    slug: "mexico",
    name: "México",
    demonym: "mexicanos",
    flag: "🇲🇽",
    currency: "$",
    currencyCode: "MXN",
    currencyName: "peso",
    phonePrefix: "+52",
    taxIdLabel: "RFC",
    cities: [
      "Ciudad de México",
      "Guadalajara",
      "Monterrey",
      "Puebla",
      "Tijuana",
      "León",
      "Querétaro",
      "Mérida",
    ],
    serpGl: "mx",
    serpDomain: "google.com.mx",
    joobleLocation: "México",
  },
  {
    code: "co",
    slug: "colombia",
    name: "Colombia",
    demonym: "colombianos",
    flag: "🇨🇴",
    currency: "$",
    currencyCode: "COP",
    currencyName: "peso",
    phonePrefix: "+57",
    taxIdLabel: "NIT",
    cities: [
      "Bogotá",
      "Medellín",
      "Cali",
      "Barranquilla",
      "Cartagena",
      "Cúcuta",
      "Bucaramanga",
      "Pereira",
    ],
    serpGl: "co",
    serpDomain: "google.com.co",
    joobleLocation: "Colombia",
  },
  {
    code: "cl",
    slug: "chile",
    name: "Chile",
    demonym: "chilenos",
    flag: "🇨🇱",
    currency: "$",
    currencyCode: "CLP",
    currencyName: "peso",
    phonePrefix: "+56",
    taxIdLabel: "RUT",
    cities: [
      "Santiago",
      "Valparaíso",
      "Concepción",
      "La Serena",
      "Antofagasta",
      "Temuco",
      "Rancagua",
      "Iquique",
    ],
    serpGl: "cl",
    serpDomain: "google.cl",
    joobleLocation: "Chile",
  },
  {
    code: "bo",
    slug: "bolivia",
    name: "Bolivia",
    demonym: "bolivianos",
    flag: "🇧🇴",
    currency: "Bs",
    currencyCode: "BOB",
    currencyName: "boliviano",
    phonePrefix: "+591",
    taxIdLabel: "NIT",
    cities: [
      "La Paz",
      "Santa Cruz de la Sierra",
      "Cochabamba",
      "El Alto",
      "Oruro",
      "Sucre",
      "Tarija",
      "Potosí",
    ],
    serpGl: "bo",
    serpDomain: "google.com.bo",
    joobleLocation: "Bolivia",
  },
];

export const DEFAULT_COUNTRY =
  COUNTRIES.find((c) => c.default) ?? COUNTRIES[0];

export function countryByCode(code: string | null | undefined): Country {
  return COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY;
}

export function countryBySlug(slug: string): Country | null {
  return COUNTRIES.find((c) => c.slug === slug) ?? null;
}
