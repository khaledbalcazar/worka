import type {
  Application,
  Candidate,
  ChatMessage,
  Company,
  CompanyPost,
  Interview,
  Job,
  JobWithCompany,
  Notification,
  Report,
  WorkReference,
} from "./types";

// Datos de ejemplo para navegar la app sin Supabase.
// Al conectar Supabase, la capa lib/data.ts consulta la base real.

export const CITIES = [
  "Asunción",
  "Ciudad del Este",
  "San Lorenzo",
  "Luque",
  "Lambaré",
  "Fernando de la Mora",
  "Encarnación",
  "Capiatá",
];

export const INDUSTRIES = [
  "Ventas",
  "Gastronomía",
  "Atención al Cliente",
  "Logística",
  "Administración",
  "Limpieza",
  "Seguridad",
  "Tecnología",
  "Salud",
  "Construcción",
];

export const CONTRACT_TYPES = [
  "Tiempo completo",
  "Medio tiempo",
  "Por turnos",
  "Pasantía",
  "Freelance",
] as const;

export const companies: Company[] = [
  {
    id: "c1",
    company_name: "Supermercados Guaraní S.A.",
    trade_name: "Super Guaraní",
    ruc: "80012345-6",
    logo_url: null,
    banner_url: null,
    description:
      "Cadena de supermercados con 12 sucursales en Gran Asunción. Más de 800 colaboradores. Creemos en el crecimiento interno: el 60% de nuestros encargados empezó como cajero o repositor.",
    location_city: "Asunción",
    website_url: "https://superguarani.com.py",
    instagram_url: "https://instagram.com/superguarani",
    facebook_url: "https://facebook.com/superguarani",
    badges: ["fundadora", "responde_rapido", "primer_empleo"],
    is_verified: true,
    ruc_check_status: "coincide",
    fast_responder: true,
    created_at: "2026-03-10T09:00:00Z",
  },
  {
    id: "c2",
    company_name: "Gastronomía del Este S.R.L.",
    trade_name: "Lo de Ña Eusebia",
    ruc: "80098765-1",
    logo_url: null,
    banner_url: null,
    description:
      "Restaurante de comida paraguaya con 3 locales en Ciudad del Este. Ambiente familiar y propinas compartidas en partes iguales.",
    location_city: "Ciudad del Este",
    website_url: null,
    instagram_url: "https://instagram.com/lodenaeusebia",
    facebook_url: null,
    badges: ["fundadora"],
    is_verified: true,
    ruc_check_status: "coincide",
    fast_responder: false,
    created_at: "2026-04-22T14:30:00Z",
  },
  {
    id: "c3",
    company_name: "TecnoPy S.A.",
    trade_name: "TecnoPy",
    ruc: "80055443-2",
    logo_url: null,
    banner_url: null,
    description:
      "Empresa de desarrollo de software y soporte técnico para el mercado local y regional. Cultura de aprendizaje continuo con presupuesto anual de capacitación.",
    location_city: "Asunción",
    website_url: "https://tecnopy.com.py",
    instagram_url: null,
    facebook_url: null,
    badges: ["responde_rapido", "top_empleador"],
    is_verified: true,
    ruc_check_status: "coincide",
    fast_responder: true,
    created_at: "2026-01-15T11:00:00Z",
  },
  {
    id: "c4",
    company_name: "Distribuidora Ypacaraí S.R.L.",
    trade_name: "DYSA Distribuciones",
    ruc: "80077889-3",
    logo_url: null,
    banner_url: null,
    description: "Distribución de productos de consumo masivo en todo el país.",
    location_city: "San Lorenzo",
    website_url: null,
    instagram_url: null,
    facebook_url: null,
    badges: [],
    is_verified: false,
    ruc_check_status: "pendiente",
    fast_responder: false,
    created_at: "2026-07-01T08:00:00Z",
  },
];

export const companyPosts: CompanyPost[] = [
  {
    id: "p1",
    company_id: "c1",
    content:
      "¡Abrimos nuestra sucursal N° 13 en Luque! 🎉 En las próximas semanas vamos a publicar 15 vacantes nuevas. Activá tus alertas.",
    created_at: "2026-07-15T10:00:00Z",
  },
  {
    id: "p2",
    company_id: "c1",
    content:
      "Este mes, 4 compañeros ascendieron de repositor a encargado de sección. En Super Guaraní se crece. 💪",
    created_at: "2026-07-08T09:00:00Z",
  },
];

export const jobs: Job[] = [
  {
    id: "j1",
    company_id: "c1",
    title: "Cajero/a para sucursal centro",
    description:
      "Buscamos cajero/a para nuestra sucursal del centro de Asunción. Atención al cliente, manejo de caja registradora y arqueo diario. No se requiere experiencia previa: nosotros te capacitamos con un programa de 2 semanas pagas.",
    industry: "Ventas",
    modality: "Presencial",
    contract_type: "Por turnos",
    salary_range: "Gs. 2.800.000 + bonificaciones",
    schedule: "Turnos rotativos de 8 h, lunes a sábado",
    address: "Palma 850 casi Ayolas, Asunción",
    nearby_transit: "Líneas 12, 30 y 56",
    requirements: [
      "Mayor de 18 años",
      "Secundaria completa",
      "Disponibilidad para turnos rotativos",
    ],
    benefits: [
      "IPS desde el día 1",
      "Capacitación paga",
      "Descuento en compras del súper",
      "Posibilidad de crecimiento interno",
    ],
    vacancies_count: 3,
    status: "Activo",
    requires_experience: false,
    urgent: true,
    featured: true,
    filter_questions: [
      { id: "q1", question: "¿Podés trabajar fines de semana?" },
      { id: "q2", question: "¿Vivís en Asunción o alrededores?" },
    ],
    views_count: 342,
    created_at: "2026-07-14T10:00:00Z",
    expires_at: "2026-08-14T10:00:00Z",
  },
  {
    id: "j2",
    company_id: "c2",
    title: "Mozo/a con experiencia",
    description:
      "Restaurante en pleno centro de CDE busca mozo/a con al menos 1 año de experiencia. Buen trato al cliente, agilidad y trabajo en equipo.",
    industry: "Gastronomía",
    modality: "Presencial",
    contract_type: "Tiempo completo",
    salary_range: "Gs. 2.900.000 + propinas",
    schedule: "Martes a domingo, 11:00 a 15:00 y 18:00 a 23:00",
    address: "Av. San Blas km 4, Ciudad del Este",
    nearby_transit: "Líneas 4 y 7 (km 4)",
    requirements: ["1 año de experiencia como mozo/a", "Buena presencia y trato"],
    benefits: ["Propinas compartidas", "Almuerzo y cena incluidos", "IPS"],
    vacancies_count: 2,
    status: "Activo",
    requires_experience: true,
    urgent: false,
    featured: false,
    filter_questions: [
      { id: "q1", question: "¿Tenés experiencia previa como mozo/a?" },
      { id: "q2", question: "¿Podés trabajar en horario nocturno?" },
    ],
    views_count: 187,
    created_at: "2026-07-12T15:00:00Z",
    expires_at: "2026-08-12T15:00:00Z",
  },
  {
    id: "j3",
    company_id: "c3",
    title: "Soporte técnico junior",
    description:
      "Sumate a nuestro equipo de soporte. Atención de tickets, instalación de equipos y asistencia remota a clientes. Ideal para estudiantes de informática. Camino claro de crecimiento hacia desarrollo.",
    industry: "Tecnología",
    modality: "Híbrido",
    contract_type: "Tiempo completo",
    salary_range: "Gs. 3.500.000",
    schedule: "Lunes a viernes de 8:00 a 17:00 (3 días presencial)",
    address: "Av. Mariscal López 3811, Villa Morra, Asunción",
    nearby_transit: "Líneas 28 y 31 (Villa Morra)",
    requirements: [
      "Estudiante o egresado de informática",
      "Conocimientos básicos de redes",
      "Ganas de aprender",
    ],
    benefits: [
      "IPS + seguro privado",
      "Presupuesto de capacitación",
      "Home office 2 días",
      "Notebook de la empresa",
    ],
    vacancies_count: 1,
    status: "Activo",
    requires_experience: false,
    urgent: false,
    featured: true,
    filter_questions: [
      { id: "q1", question: "¿Estás estudiando o estudiaste informática?" },
    ],
    views_count: 521,
    created_at: "2026-07-10T09:00:00Z",
    expires_at: "2026-08-10T09:00:00Z",
  },
  {
    id: "j4",
    company_id: "c1",
    title: "Repositor/a de mercaderías",
    description:
      "Reposición de mercaderías en góndolas, control de vencimientos y apoyo en depósito. Turno mañana o tarde. No se requiere experiencia.",
    industry: "Logística",
    modality: "Presencial",
    contract_type: "Por turnos",
    salary_range: "Gs. 2.800.000",
    schedule: "Turno mañana (6:00-14:00) o tarde (14:00-22:00)",
    address: "Av. Eusebio Ayala 4501, Asunción",
    nearby_transit: "Líneas 15 y 23",
    requirements: ["Mayor de 18 años", "Poder levantar hasta 20 kg"],
    benefits: ["IPS desde el día 1", "Descuento en compras", "Uniforme provisto"],
    vacancies_count: 4,
    status: "Activo",
    requires_experience: false,
    urgent: false,
    featured: false,
    filter_questions: [
      { id: "q1", question: "¿Podés levantar peso (hasta 20 kg)?" },
    ],
    views_count: 156,
    created_at: "2026-07-15T08:00:00Z",
    expires_at: "2026-08-15T08:00:00Z",
  },
  {
    id: "j5",
    company_id: "c4",
    title: "Chofer repartidor con registro profesional",
    description:
      "Reparto de mercaderías en Gran Asunción con camioneta de la empresa. Registro profesional al día excluyente. Conocimiento de calles de Asunción y alrededores.",
    industry: "Logística",
    modality: "Presencial",
    contract_type: "Tiempo completo",
    salary_range: null,
    schedule: "Lunes a viernes de 7:00 a 16:00",
    address: "Ruta 2 km 12, San Lorenzo",
    nearby_transit: "Líneas 49 y 56 (San Lorenzo centro)",
    requirements: [
      "Registro profesional vigente",
      "Experiencia en reparto",
      "Conocer Gran Asunción",
    ],
    benefits: ["Combustible a cargo de la empresa", "IPS"],
    vacancies_count: 2,
    status: "Activo",
    requires_experience: true,
    urgent: true,
    featured: false,
    filter_questions: [
      { id: "q1", question: "¿Tenés registro de conducir profesional vigente?" },
      { id: "q2", question: "¿Conocés bien las calles de Gran Asunción?" },
    ],
    views_count: 98,
    created_at: "2026-07-16T07:30:00Z",
    expires_at: "2026-08-16T07:30:00Z",
  },
  {
    id: "j6",
    company_id: "c3",
    title: "Desarrollador/a frontend React",
    description:
      "Buscamos dev frontend con experiencia en React/Next.js para proyectos de clientes regionales. Trabajo remoto con reuniones presenciales mensuales.",
    industry: "Tecnología",
    modality: "Remoto",
    contract_type: "Tiempo completo",
    salary_range: "Gs. 8.000.000 - 11.000.000",
    schedule: "Flexible, con core hours de 10:00 a 15:00",
    address: null,
    nearby_transit: null,
    requirements: [
      "2+ años con React",
      "TypeScript",
      "Inglés técnico de lectura",
    ],
    benefits: [
      "100% remoto",
      "Seguro privado",
      "Bono anual por desempeño",
      "Presupuesto de capacitación",
    ],
    vacancies_count: 1,
    status: "Activo",
    requires_experience: true,
    urgent: false,
    featured: false,
    filter_questions: [
      { id: "q1", question: "¿Tenés 2+ años de experiencia con React?" },
    ],
    views_count: 734,
    created_at: "2026-07-08T12:00:00Z",
    expires_at: "2026-08-08T12:00:00Z",
  },
  {
    id: "j7",
    company_id: "c4",
    title: "Promotor/a de ventas — ¡ganá hasta 10 millones!",
    description:
      "Oportunidad única. Ganancias ilimitadas desde tu casa. Solo necesitás una pequeña inversión inicial para tu kit de arranque.",
    industry: "Ventas",
    modality: "Remoto",
    contract_type: null,
    salary_range: "Gs. 10.000.000",
    schedule: null,
    address: null,
    nearby_transit: null,
    requirements: [],
    benefits: [],
    vacancies_count: 1,
    status: "Moderacion",
    requires_experience: false,
    urgent: false,
    featured: false,
    filter_questions: [],
    views_count: 45,
    created_at: "2026-07-13T18:00:00Z",
    expires_at: "2026-08-13T18:00:00Z",
  },
  {
    id: "j8",
    company_id: "c2",
    title: "Ayudante de cocina",
    description:
      "Preparación de ingredientes, limpieza de estación y apoyo al cocinero principal. Se valora ganas de aprender. Almuerzo incluido.",
    industry: "Gastronomía",
    modality: "Presencial",
    contract_type: "Medio tiempo",
    salary_range: "Gs. 2.800.000",
    schedule: "Lunes a sábado de 9:00 a 15:00",
    address: "Av. San Blas km 4, Ciudad del Este",
    nearby_transit: "Líneas 4 y 7 (km 4)",
    requirements: ["Ganas de aprender"],
    benefits: ["Almuerzo incluido", "IPS"],
    vacancies_count: 1,
    status: "Cerrado",
    requires_experience: false,
    urgent: false,
    featured: false,
    filter_questions: [],
    views_count: 264,
    created_at: "2026-06-10T10:00:00Z",
    expires_at: "2026-07-10T10:00:00Z",
  },
];

export const currentCandidate: Candidate = {
  id: "cand1",
  full_name: "María Fernanda González",
  phone_whatsapp: "+595 981 234 567",
  phone_verified: true,
  identity_status: "none",
  location_city: "Asunción",
  cv_url: null,
  cv_text: null,
  preferences_industry: ["Ventas", "Atención al Cliente"],
  preferences_modality: "Full-time",
  first_job_mode: true,
  alerts_enabled: true,
  visible_to_companies: true,
  public_profile: true,
  created_at: "2026-07-05T16:00:00Z",
};

// Candidatos visibles para la búsqueda activa de talento (lado empresa)
export const talentPool: Candidate[] = [
  currentCandidate,
  {
    ...currentCandidate,
    id: "cand2",
    full_name: "Carlos Benítez",
    phone_whatsapp: "+595 982 111 222",
    identity_status: "verified",
    location_city: "Asunción",
    preferences_industry: ["Logística", "Seguridad"],
    first_job_mode: false,
  },
  {
    ...currentCandidate,
    id: "cand3",
    full_name: "Lucía Martínez",
    phone_whatsapp: "+595 983 333 444",
    identity_status: "none",
    location_city: "Lambaré",
    preferences_industry: ["Gastronomía"],
    first_job_mode: true,
  },
  {
    ...currentCandidate,
    id: "cand4",
    full_name: "Jorge Villalba",
    phone_whatsapp: "+595 984 555 666",
    identity_status: "pending",
    location_city: "San Lorenzo",
    preferences_industry: ["Tecnología", "Administración"],
    first_job_mode: false,
  },
];

export const workReferences: WorkReference[] = [
  {
    id: "ref1",
    candidate_id: "cand1",
    referrer_name: "Rosa Duarte",
    referrer_phone: "+595 985 777 888",
    relationship: "Fue mi encargada en la despensa familiar (2024-2025)",
    status: "confirmada",
    token: "demo-token-ref1",
    created_at: "2026-07-10T10:00:00Z",
  },
];

// Configuración del sitio (en live vive en la tabla site_settings)
export const defaultSiteSettings: Record<string, string> = {
  site_name: "Worka",
  logo_url: "",
  hero_title: "Tu próximo paso empieza acá.",
  hero_subtitle:
    "La plataforma de empleo pensada para Paraguay: empresas verificadas, alertas por WhatsApp y hasta las líneas de colectivo para llegar a tu entrevista.",
  contact_email: "hola@worka.com.py",
  contact_whatsapp: "+595 981 000 000",
  payment_link: "",
  help_text: "Escribinos por WhatsApp o email y te respondemos en el día.",
};

export const interviews: Interview[] = [
  {
    id: "int1",
    application_id: "a2",
    proposed_at: "2026-07-21T10:00:00Z",
    location: "Oficina TecnoPy — Av. Mcal. López 3811, Villa Morra",
    status: "propuesta",
    created_at: "2026-07-16T15:00:00Z",
  },
];

export const notifications: Notification[] = [
  {
    id: "n1",
    user_id: "cand1",
    icon: "📅",
    title: "TecnoPy te propuso una entrevista",
    body: "Martes 21 de julio, 10:00 — confirmá desde tus postulaciones.",
    href: "/postulaciones",
    read: false,
    created_at: "2026-07-16T15:00:00Z",
  },
  {
    id: "n2",
    user_id: "cand1",
    icon: "👀",
    title: "Super Guaraní vio tu perfil",
    body: "Revisaron tu postulación a Cajero/a para sucursal centro.",
    href: "/postulaciones",
    read: false,
    created_at: "2026-07-15T09:00:00Z",
  },
  {
    id: "n3",
    user_id: "cand1",
    icon: "✨",
    title: "3 vacantes nuevas de Ventas en Asunción",
    body: "Coinciden con tus rubros de interés.",
    href: "/empleos",
    read: true,
    created_at: "2026-07-14T08:00:00Z",
  },
];

export const chatMessages: ChatMessage[] = [
  {
    id: "m1",
    application_id: "a1",
    sender: "company",
    content:
      "¡Hola María! Vimos tu postulación y nos gustó tu perfil. ¿Seguís interesada en el puesto?",
    created_at: "2026-07-15T10:00:00Z",
  },
  {
    id: "m2",
    application_id: "a1",
    sender: "candidate",
    content: "¡Hola! Sí, muy interesada. Quedo atenta, ¡gracias!",
    created_at: "2026-07-15T10:12:00Z",
  },
];

// Empresas que sigue la candidata demo
export const followedCompanyIds = ["c3"];

export const applications: Application[] = [
  {
    id: "a1",
    job_id: "j1",
    candidate_id: "cand1",
    status: "Contactado",
    rejection_reason: null,
    answers: [
      { question_id: "q1", answer: true },
      { question_id: "q2", answer: true },
    ],
    applied_at: "2026-07-14T11:30:00Z",
    reviewed_at: "2026-07-15T09:00:00Z",
  },
  {
    id: "a2",
    job_id: "j3",
    candidate_id: "cand1",
    status: "Revisado",
    rejection_reason: null,
    answers: [{ question_id: "q1", answer: false }],
    applied_at: "2026-07-11T10:00:00Z",
    reviewed_at: "2026-07-12T14:20:00Z",
  },
  {
    id: "a3",
    job_id: "j8",
    candidate_id: "cand1",
    status: "Rechazado",
    rejection_reason: "Puesto cubierto",
    answers: [],
    applied_at: "2026-06-15T09:00:00Z",
    reviewed_at: "2026-06-20T10:00:00Z",
  },
];

// Postulantes de ejemplo para el kanban de la empresa
export const companyApplicants = [
  {
    id: "a10",
    candidate_name: "Carlos Benítez",
    candidate_city: "Asunción",
    status: "Pendiente" as const,
    applied_at: "2026-07-16T09:00:00Z",
    answers_ok: 2,
    answers_total: 2,
  },
  {
    id: "a11",
    candidate_name: "Lucía Martínez",
    candidate_city: "Lambaré",
    status: "Pendiente" as const,
    applied_at: "2026-07-16T14:00:00Z",
    answers_ok: 1,
    answers_total: 2,
  },
  {
    id: "a12",
    candidate_name: "María Fernanda González",
    candidate_city: "Asunción",
    status: "Contactado" as const,
    applied_at: "2026-07-14T11:30:00Z",
    answers_ok: 2,
    answers_total: 2,
  },
  {
    id: "a13",
    candidate_name: "Jorge Villalba",
    candidate_city: "San Lorenzo",
    status: "Revisado" as const,
    applied_at: "2026-07-15T08:00:00Z",
    answers_ok: 2,
    answers_total: 2,
  },
  {
    id: "a14",
    candidate_name: "Rosa Cáceres",
    candidate_city: "Capiatá",
    status: "Rechazado" as const,
    applied_at: "2026-07-14T19:00:00Z",
    answers_ok: 0,
    answers_total: 2,
  },
];

export const reports: Report[] = [
  {
    id: "r1",
    job_id: "j7",
    reporter_id: "cand2",
    reason: "Piden dinero para empezar",
    created_at: "2026-07-14T10:00:00Z",
  },
  {
    id: "r2",
    job_id: "j7",
    reporter_id: "cand3",
    reason: "Parece estafa piramidal",
    created_at: "2026-07-14T16:00:00Z",
  },
  {
    id: "r3",
    job_id: "j7",
    reporter_id: "cand4",
    reason: "Salario irreal para el rubro",
    created_at: "2026-07-15T08:00:00Z",
  },
];

// Vacantes guardadas por la candidata de ejemplo
export const savedJobIds = ["j5"];

export function getJobsWithCompany(): JobWithCompany[] {
  return jobs.map((job) => ({
    ...job,
    company: companies.find((c) => c.id === job.company_id)!,
  }));
}

export function getActiveJobs(): JobWithCompany[] {
  return getJobsWithCompany().filter((j) => j.status === "Activo");
}

export function getJobById(id: string): JobWithCompany | undefined {
  return getJobsWithCompany().find((j) => j.id === id);
}

export function getApplicationsWithJob() {
  return applications.map((app) => ({
    ...app,
    job: getJobById(app.job_id)!,
  }));
}
