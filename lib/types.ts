// Tipos del modelo de datos de Worka (espejo del esquema de Supabase)

export type Role = "candidate" | "company" | "admin";

export type Modality = "Presencial" | "Híbrido" | "Remoto";

export type JobStatus = "Activo" | "Pausado" | "Cerrado" | "Moderacion";

export type ApplicationStatus =
  | "Pendiente"
  | "Revisado"
  | "Contactado"
  | "Rechazado";

export type RejectionReason =
  | "Buscamos más experiencia"
  | "Puesto cubierto"
  | "Perfil distinto al buscado";

export type ContractType =
  | "Tiempo completo"
  | "Medio tiempo"
  | "Por turnos"
  | "Pasantía"
  | "Freelance";

// Insignias que una empresa puede desbloquear (o recibir desde el admin)
export type BadgeId =
  | "fundadora"
  | "responde_rapido"
  | "primer_empleo"
  | "top_empleador"
  | "inclusiva";

export interface BadgeInfo {
  id: BadgeId;
  emoji: string;
  label: string;
  description: string;
}

// Fuente de vacantes externas configurada desde el admin.
export interface JobSource {
  id: string;
  name: string;
  kind: "auto" | "feed" | "html";
  url: string;
  enabled: boolean;
  expire_days: number;
  sel_item: string | null;
  sel_title: string | null;
  sel_company: string | null;
  sel_city: string | null;
  sel_link: string | null;
  sel_description: string | null;
  default_city: string | null;
  default_industry: string | null;
  last_run_at: string | null;
  last_result: string | null;
  last_method: string | null;
  last_count: number;
  created_at: string;
}

// Vacante que no viene de una empresa registrada en Worka.
// apply_email/apply_url llegan en null si el visitante no inició sesión.
export interface ExternalJob {
  id: string;
  source_id: string | null;
  external_key: string | null;
  title: string;
  company_name: string;
  company_logo_url: string | null;
  description: string;
  industry: string | null;
  city: string | null;
  modality: string | null;
  contract_type: string | null;
  salary_range: string | null;
  apply_email: string | null;
  apply_url: string | null;
  source_name: string;
  source_url: string | null;
  status: "activa" | "oculta";
  imported_at: string;
  expires_at: string | null;
  created_at: string;
}

// Artículo del blog (SEO). audience define el CTA que se muestra al final.
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // markdown liviano
  cover_url: string | null;
  audience: "personas" | "empresas";
  status: "borrador" | "publicado";
  author: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// Insignia creada por el admin. Su id (uuid) se guarda en companies.badges
// igual que las del catálogo fijo.
export interface CustomBadge {
  id: string;
  emoji: string;
  label: string;
  description: string;
  created_at: string;
}

// Insignia ya resuelta a datos visibles (fija o personalizada).
export type ResolvedBadge = {
  id: string;
  emoji: string;
  label: string;
  description: string;
};

// Combina el catálogo fijo + las personalizadas en un solo lookup por id.
export function resolveBadges(
  ids: string[],
  custom: CustomBadge[] = []
): ResolvedBadge[] {
  const lookup = new Map<string, ResolvedBadge>();
  for (const b of BADGE_CATALOG) lookup.set(b.id, b);
  for (const b of custom)
    lookup.set(b.id, {
      id: b.id,
      emoji: b.emoji,
      label: b.label,
      description: b.description,
    });
  return ids.map((id) => lookup.get(id)).filter((b): b is ResolvedBadge => !!b);
}

export const BADGE_CATALOG: BadgeInfo[] = [
  {
    id: "fundadora",
    emoji: "🌟",
    label: "Empresa fundadora",
    description: "Estuvo en Worka desde el primer día.",
  },
  {
    id: "responde_rapido",
    emoji: "⚡",
    label: "Responde rápido",
    description: "Responde a los postulantes en menos de 72 horas.",
  },
  {
    id: "primer_empleo",
    emoji: "✨",
    label: "Impulsa primeros empleos",
    description: "Publica vacantes sin requisito de experiencia.",
  },
  {
    id: "top_empleador",
    emoji: "🏆",
    label: "Top empleador del mes",
    description: "Reconocida por los candidatos este mes.",
  },
  {
    id: "inclusiva",
    emoji: "🤝",
    label: "Empleadora inclusiva",
    description: "Comprometida con la diversidad en sus contrataciones.",
  },
];

export type IdentityStatus = "none" | "pending" | "verified";

export interface Candidate {
  id: string;
  full_name: string;
  phone_whatsapp: string;
  phone_verified: boolean;
  identity_status: IdentityStatus;
  location_city: string;
  avatar_url: string | null;
  bio: string | null;
  cv_url: string | null;
  cv_text: string | null;
  preferences_industry: string[];
  preferences_modality: string;
  first_job_mode: boolean;
  alerts_enabled: boolean;
  visible_to_companies: boolean;
  public_profile: boolean;
  open_to_other_cities: boolean;
  created_at: string;
}

// Miembro del equipo de reclutamiento de una empresa
export interface CompanyMember {
  id: string;
  company_id: string;
  email: string;
  member_id: string | null;
  status: "invitada" | "activa";
  created_at: string;
}

// Referencia laboral: un ex-empleador confirma por WhatsApp mediante un link único
export interface WorkReference {
  id: string;
  candidate_id: string;
  referrer_name: string;
  referrer_phone: string;
  relationship: string; // ej: "Fui su encargado en Super Guaraní"
  status: "pendiente" | "generada" | "confirmada";
  token: string; // link único /ref/[token]
  created_at: string;
}

// Potenciar empleo: vacante destacada paga
export interface BoostRequest {
  id: string;
  job_id: string;
  company_id: string;
  plan: string;
  price_gs: number;
  status: "pendiente_pago" | "activo" | "rechazado";
  created_at: string;
}

export const BOOST_PLANS = [
  { plan: "7 días destacada", days: 7, price_gs: 150000 },
  { plan: "15 días destacada", days: 15, price_gs: 250000 },
  { plan: "30 días destacada", days: 30, price_gs: 400000 },
] as const;

export interface Interview {
  id: string;
  application_id: string;
  proposed_at: string; // fecha y hora propuestas
  location: string;
  status: "propuesta" | "confirmada" | "rechazada";
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  icon: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  application_id: string;
  sender: "candidate" | "company";
  content: string;
  created_at: string;
}

export interface Company {
  id: string;
  company_name: string;
  trade_name: string;
  ruc: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string;
  location_city: string;
  website_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  badges: BadgeId[];
  is_verified: boolean;
  ruc_check_status: "pendiente" | "coincide" | "no_coincide";
  fast_responder: boolean;
  created_at: string;
}

export interface CompanyPost {
  id: string;
  company_id: string;
  content: string;
  created_at: string;
}

export interface FilterQuestion {
  id: string;
  question: string;
  knockout?: boolean; // responder "No" descarta automáticamente
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  industry: string;
  modality: Modality;
  contract_type: ContractType | null;
  salary_range: string | null;
  schedule: string | null;
  address: string | null;
  nearby_transit: string | null;
  requirements: string[];
  benefits: string[];
  vacancies_count: number;
  status: JobStatus;
  requires_experience: boolean;
  urgent: boolean;
  featured: boolean;
  filter_questions: FilterQuestion[];
  views_count: number;
  created_at: string;
  expires_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  rejection_reason: RejectionReason | null;
  answers: { question_id: string; answer: boolean }[];
  applied_at: string;
  reviewed_at: string | null;
}

export interface Report {
  id: string;
  job_id: string;
  reporter_id: string;
  reason: string;
  created_at: string;
}

export interface JobWithCompany extends Job {
  company: Company;
}
