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
  // Párrafo único por país (SEO): evita contenido duplicado entre landings.
  blurb: string;
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
    blurb:
      "En Paraguay el empleo se mueve fuerte en comercio y supermercados, gastronomia, maquilas y logistica. Worka reune vacantes de Asuncion, Ciudad del Este, San Lorenzo, Luque y todo el pais, con el dato de como llegar en colectivo a cada trabajo y empresas verificadas por su RUC ante la DNIT.",
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
    blurb:
      "En Argentina hay demanda constante en comercio, gastronomia, atencion al cliente, logistica y administracion. En Worka encontras empleos en Buenos Aires, Cordoba, Rosario, Mendoza y todo el pais, con empresas cuyo CUIT verificamos para que postules con confianza y sin pagar comisiones.",
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
    blurb:
      "En Mexico crecen las oportunidades en ventas, call center, manufactura, logistica y atencion al cliente. Worka concentra vacantes de Ciudad de Mexico, Guadalajara, Monterrey, Puebla y mas, con empresas verificadas por su RFC para que apliques gratis y con seguridad.",
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
    blurb:
      "En Colombia el mercado laboral es activo en ventas, servicios, logistica, salud y tecnologia. En Worka reunimos empleos de Bogota, Medellin, Cali, Barranquilla y todo el pais, con empresas verificadas por su NIT para que te postules gratis y sin intermediarios.",
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
    blurb:
      "En Chile hay busqueda permanente en retail, servicios, mineria, logistica y administracion. Worka agrupa vacantes de Santiago, Valparaiso, Concepcion, La Serena y mas, con empresas verificadas por su RUT para que apliques rapido, gratis y con confianza.",
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
    blurb:
      "En Bolivia el empleo se concentra en comercio, servicios, manufactura y transporte. En Worka encontras oportunidades en La Paz, Santa Cruz de la Sierra, Cochabamba, El Alto y todo el pais, con empresas verificadas por su NIT para que te postules gratis y con seguridad.",
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
