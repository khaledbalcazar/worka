// Directorio de ciudades para elegir dónde es una vacante (y dónde está una
// empresa). Sin dependencias: lo usan el formulario, el mapa y los filtros.
//
// Paraguay va completo: todos los distritos, agrupados por departamento, para
// que una vacante en Hohenau o en Curuguaty no tenga que figurar como
// «Asunción». En el resto de los países van las ciudades principales; el
// selector igual deja escribir una que no esté.
//
// `country.cities` (lib/countries.ts) sigue siendo la lista corta de ciudades
// destacadas para los filtros rápidos y las landings.

export type CityEntry = { name: string; region: string };
type Coords = [number, number];

const PY: Record<string, string[]> = {
  Capital: ["Asunción"],
  Central: [
    "Areguá", "Capiatá", "Fernando de la Mora", "Guarambaré", "Itá", "Itauguá", "J. Augusto Saldívar", "Lambaré",
    "Limpio", "Luque", "Mariano Roque Alonso", "Nueva Italia", "Ñemby", "San Antonio", "San Lorenzo", "Villa Elisa",
    "Villeta", "Ypacaraí", "Ypané",
  ],
  "Alto Paraná": [
    "Ciudad del Este", "Presidente Franco", "Hernandarias", "Minga Guazú", "Santa Rita", "Domingo Martínez de Irala",
    "Doctor Juan León Mallorquín", "Doctor Raúl Peña", "Iruña", "Itakyry", "Juan Emilio O'Leary", "Los Cedrales",
    "Mbaracayú", "Minga Porá", "Naranjal", "Ñacunday", "San Alberto", "San Cristóbal", "Santa Fe del Paraná",
    "Santa Rosa del Monday", "Tavapy", "Yguazú",
  ],
  Itapúa: [
    "Encarnación", "Alto Verá", "Bella Vista", "Cambyretá", "Capitán Meza", "Capitán Miranda", "Carlos Antonio López",
    "Carmen del Paraná", "Coronel Bogado", "Edelira", "Fram", "General Artigas", "General Delgado", "Hohenau",
    "Itapúa Poty", "Jesús", "José Leandro Oviedo", "La Paz", "Mayor Otaño", "Natalio", "Nueva Alborada", "Obligado",
    "Pirapó", "San Cosme y Damián", "San Juan del Paraná", "San Pedro del Paraná", "San Rafael del Paraná",
    "Tomás Romero Pereira", "Trinidad", "Yatytay",
  ],
  Caaguazú: [
    "Coronel Oviedo", "Caaguazú", "Carayaó", "Doctor Cecilio Báez", "Doctor J. Eulogio Estigarribia",
    "Doctor Juan Manuel Frutos", "José Domingo Ocampos", "La Pastora", "Mariscal Francisco Solano López",
    "Nueva Londres", "Nueva Toledo", "Raúl Arsenio Oviedo", "Repatriación", "R. I. Tres Corrales", "San Joaquín",
    "San José de los Arroyos", "Santa Rosa del Mbutuy", "Simón Bolívar", "Tembiaporá", "Tres de Febrero", "Vaquería",
    "Yhú",
  ],
  Cordillera: [
    "Caacupé", "Altos", "Arroyos y Esteros", "Atyrá", "Caraguatay", "Emboscada", "Eusebio Ayala", "Isla Pucú",
    "Itacurubí de la Cordillera", "Juan de Mena", "Loma Grande", "Mbocayaty del Yhaguy", "Nueva Colombia",
    "Piribebuy", "Primero de Marzo", "San Bernardino", "San José Obrero", "Santa Elena", "Tobatí", "Valenzuela",
  ],
  Paraguarí: [
    "Paraguarí", "Acahay", "Caapucú", "Caballero", "Carapeguá", "Escobar", "La Colmena", "María Antonia",
    "Mbuyapey", "Pirayú", "Quiindy", "Quyquyhó", "San Roque González de Santa Cruz", "Sapucai", "Tebicuarymí",
    "Yaguarón", "Ybycuí", "Ybytymí",
  ],
  Guairá: [
    "Villarrica", "Borja", "Coronel Martínez", "Doctor Bottrell", "Eugenio A. Garay", "Félix Pérez Cardozo",
    "Independencia", "Itapé", "Iturbe", "José Fassardi", "Mbocayaty del Guairá", "Natalicio Talavera", "Ñumí",
    "Paso Yobái", "San Salvador", "Tebicuary", "Yataity",
  ],
  "San Pedro": [
    "San Pedro de Ycuamandiyú", "San Estanislao", "Antequera", "Capiibary", "Choré", "General Elizardo Aquino",
    "General Isidoro Resquín", "Guayaibí", "Itacurubí del Rosario", "Liberación", "Lima", "Nueva Germania",
    "San José del Rosario", "San Pablo", "San Vicente Pancholo", "Santa Rosa del Aguaray", "Tacuatí", "Unión",
    "Veinticinco de Diciembre", "Villa del Rosario", "Yataity del Norte", "Yrybucuá",
  ],
  Concepción: [
    "Concepción", "Horqueta", "Arroyito", "Azotey", "Belén", "Loreto", "Paso Barreto", "San Alfredo",
    "San Carlos del Apa", "San Lázaro", "Sargento José Félix López", "Yby Yaú",
  ],
  Amambay: ["Pedro Juan Caballero", "Bella Vista Norte", "Capitán Bado", "Karapaí", "Zanja Pytã"],
  Canindeyú: [
    "Salto del Guairá", "Curuguaty", "Corpus Christi", "Francisco Caballero Álvarez", "Itanará", "Katueté",
    "La Paloma del Espíritu Santo", "Laurel", "Maracaná", "Nueva Esperanza", "Puerto Adela", "Villa Ygatimí",
    "Yasy Cañy", "Ybyrarobaná", "Yby Pytã", "Ypejhú",
  ],
  Misiones: [
    "San Juan Bautista", "Ayolas", "San Ignacio", "San Miguel", "San Patricio", "Santa María", "Santa Rosa",
    "Santiago", "Villa Florida", "Yabebyry",
  ],
  Caazapá: [
    "Caazapá", "Abaí", "Buena Vista", "Doctor Moisés S. Bertoni", "General Higinio Morínigo", "Maciel",
    "San Juan Nepomuceno", "Tavaí", "Tres de Mayo", "Yegros", "Yuty",
  ],
  Ñeembucú: [
    "Pilar", "Alberdi", "Cerrito", "Desmochados", "General José Eduvigis Díaz", "Guazú Cuá", "Humaitá",
    "Isla Umbú", "Laureles", "Mayor José J. Martínez", "Paso de Patria", "San Juan Bautista del Ñeembucú",
    "Tacuaras", "Villa Franca", "Villa Oliva", "Villalbín",
  ],
  "Presidente Hayes": [
    "Villa Hayes", "Benjamín Aceval", "General José María Bruguez", "José Falcón", "Nanawa", "Puerto Pinasco",
    "Teniente Esteban Martínez", "Teniente Irala Fernández",
  ],
  Boquerón: ["Filadelfia", "Loma Plata", "Mariscal Estigarribia", "Neuland"],
  "Alto Paraguay": ["Fuerte Olimpo", "Bahía Negra", "Carmelo Peralta", "Puerto Casado"],
};

// Centro aproximado de cada departamento (su capital). Para un distrito sin
// coordenadas propias, el mapa y la estimación del viaje usan las de su
// departamento: mejor una referencia regional que ninguna.
export const PY_REGION_COORDS: Record<string, Coords> = {
  Capital: [-25.2637, -57.5759],
  Central: [-25.3125, -57.3847],
  "Alto Paraná": [-25.5097, -54.6111],
  Itapúa: [-27.3306, -55.8667],
  Caaguazú: [-25.4478, -56.44],
  Cordillera: [-25.3861, -57.1405],
  Paraguarí: [-25.6208, -57.1464],
  Guairá: [-25.75, -56.4333],
  "San Pedro": [-24.0917, -57.0833],
  Concepción: [-23.4064, -57.4344],
  Amambay: [-22.5472, -55.7333],
  Canindeyú: [-24.0633, -54.3069],
  Misiones: [-26.6694, -57.1456],
  Caazapá: [-26.1953, -56.3681],
  Ñeembucú: [-26.8597, -58.3006],
  "Presidente Hayes": [-25.0933, -57.5236],
  Boquerón: [-22.35, -60.0333],
  "Alto Paraguay": [-21.0417, -57.8731],
};

const OTHERS: Record<string, Record<string, string[]>> = {
  ar: {
    "Buenos Aires": ["Buenos Aires", "La Plata", "Mar del Plata", "Bahía Blanca", "Quilmes", "Lomas de Zamora", "La Matanza", "Morón", "Tigre", "San Isidro", "Pilar", "Lanús", "Avellaneda", "Tandil", "Merlo", "Moreno"],
    Córdoba: ["Córdoba", "Río Cuarto", "Villa María", "Villa Carlos Paz", "San Francisco"],
    "Santa Fe": ["Rosario", "Santa Fe", "Rafaela", "Venado Tuerto", "Reconquista"],
    Mendoza: ["Mendoza", "San Rafael", "Godoy Cruz", "Luján de Cuyo"],
    "Noroeste": ["San Miguel de Tucumán", "Salta", "San Salvador de Jujuy", "Santiago del Estero", "San Fernando del Valle de Catamarca", "La Rioja"],
    "Noreste": ["Corrientes", "Resistencia", "Posadas", "Formosa", "Oberá", "Puerto Iguazú", "Paraná", "Concordia"],
    Cuyo: ["San Juan", "San Luis", "Villa Mercedes"],
    Patagonia: ["Neuquén", "Bariloche", "Comodoro Rivadavia", "Río Gallegos", "Ushuaia", "Trelew", "Puerto Madryn", "General Roca", "Santa Rosa"],
  },
  mx: {
    Centro: ["Ciudad de México", "Puebla", "Querétaro", "Toluca", "Pachuca", "Cuernavaca", "Tlaxcala", "Ecatepec", "Naucalpan"],
    Occidente: ["Guadalajara", "Zapopan", "León", "Aguascalientes", "Morelia", "Colima", "Tepic", "Puerto Vallarta", "Irapuato", "Celaya"],
    Norte: ["Monterrey", "Tijuana", "Ciudad Juárez", "Chihuahua", "Saltillo", "Hermosillo", "Mexicali", "Torreón", "Culiacán", "Durango", "San Luis Potosí", "Reynosa", "Mazatlán", "Ensenada", "Zacatecas"],
    Sur: ["Mérida", "Cancún", "Veracruz", "Oaxaca", "Villahermosa", "Tuxtla Gutiérrez", "Acapulco", "Xalapa", "Campeche", "Chetumal", "Playa del Carmen"],
  },
  co: {
    Andina: ["Bogotá", "Medellín", "Cali", "Bucaramanga", "Pereira", "Manizales", "Ibagué", "Cúcuta", "Armenia", "Tunja", "Neiva", "Pasto", "Popayán", "Soacha", "Bello", "Envigado", "Itagüí"],
    Caribe: ["Barranquilla", "Cartagena", "Santa Marta", "Montería", "Valledupar", "Sincelejo", "Riohacha"],
    Otras: ["Villavicencio", "Yopal", "Buenaventura", "Palmira", "Florencia", "Leticia", "Quibdó"],
  },
  cl: {
    Norte: ["Arica", "Iquique", "Antofagasta", "Calama", "Copiapó", "La Serena", "Coquimbo"],
    Centro: ["Santiago", "Puente Alto", "Maipú", "Valparaíso", "Viña del Mar", "Rancagua", "Talca", "Curicó", "San Antonio", "Quilpué"],
    Sur: ["Concepción", "Talcahuano", "Chillán", "Los Ángeles", "Temuco", "Valdivia", "Osorno", "Puerto Montt", "Coyhaique", "Punta Arenas"],
  },
  bo: {
    Occidente: ["La Paz", "El Alto", "Oruro", "Potosí", "Viacha"],
    Valles: ["Cochabamba", "Sucre", "Tarija", "Quillacollo", "Sacaba"],
    Oriente: ["Santa Cruz de la Sierra", "Montero", "Warnes", "Trinidad", "Cobija", "Riberalta", "Yacuiba", "Puerto Suárez"],
  },
};

function flatten(table: Record<string, string[]>): CityEntry[] {
  return Object.entries(table).flatMap(([region, names]) => names.map((name) => ({ name, region })));
}

const DIRECTORY: Record<string, CityEntry[]> = {
  py: flatten(PY),
  ...Object.fromEntries(Object.entries(OTHERS).map(([code, table]) => [code, flatten(table)])),
};

export function allCities(countryCode: string | null | undefined): CityEntry[] {
  return DIRECTORY[countryCode ?? "py"] ?? DIRECTORY.py;
}

// Normaliza para comparar: sin tildes, sin mayúsculas, sin espacios de más.
export function normCity(value: string | null | undefined): string {
  return (value ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function findCity(countryCode: string | null | undefined, name: string | null | undefined): CityEntry | null {
  const n = normCity(name);
  if (!n) return null;
  return allCities(countryCode).find((c) => normCity(c.name) === n) ?? null;
}

// Búsqueda del selector: primero las que empiezan con lo escrito, después las
// que lo contienen (también por departamento: «itapua» trae todo Itapúa).
export function searchCities(countryCode: string | null | undefined, query: string, limit = 60): CityEntry[] {
  const list = allCities(countryCode);
  const q = normCity(query);
  if (!q) return list.slice(0, limit);
  const starts: CityEntry[] = [];
  const contains: CityEntry[] = [];
  for (const c of list) {
    const name = normCity(c.name);
    if (name.startsWith(q) || name.split(" ").some((w) => w.startsWith(q))) starts.push(c);
    else if (name.includes(q) || normCity(c.region).includes(q)) contains.push(c);
  }
  return [...starts, ...contains].slice(0, limit);
}
