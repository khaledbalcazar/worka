"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import EntityAvatar from "@/components/EntityAvatar";
import { compressImage } from "@/lib/compress-image";
import {
  FREELANCER_CATEGORIES,
  CURRENCY_OPTIONS,
  formatPrice,
} from "@/lib/freelancer";
import {
  updateFreelancerProfile,
  saveFreelancerService,
  deleteFreelancerService,
  savePortfolioItem,
  deletePortfolioItem,
  savePaymentLink,
  deletePaymentLink,
  uploadFreelancerImage,
  setQuoteStatus,
} from "@/app/actions";
import type {
  FreelancerWithIdentity,
  FreelancerService,
  PortfolioItem,
  PaymentLink,
  QuoteRequest,
} from "@/lib/types";

type Data = {
  profile: FreelancerWithIdentity;
  services: FreelancerService[];
  portfolio: PortfolioItem[];
  payment_links: PaymentLink[];
  quotes: QuoteRequest[];
};

type Tab = "perfil" | "servicios" | "portfolio" | "pagos" | "presupuestos";

const ACCENTS = ["#7C5CFC", "#2563EB", "#10B981", "#F59E0B", "#E11D6C", "#0EA5E9"];

export default function FreelancerDashboard({ data }: { data: Data }) {
  const [tab, setTab] = useState<Tab>("perfil");
  const { profile } = data;
  const nuevos = data.quotes.filter((q) => q.status === "nuevo").length;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "perfil", label: "Perfil" },
    { id: "servicios", label: "Servicios" },
    { id: "portfolio", label: "Portfolio" },
    { id: "pagos", label: "Pagos" },
    { id: "presupuestos", label: "Presupuestos", badge: nuevos },
  ];

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <EntityAvatar
            url={profile.identity.avatar_url}
            name={profile.identity.full_name}
            className="w-12 h-12 rounded-2xl"
          />
          <div>
            <h1 className="font-bold text-primary-dark">
              {profile.identity.full_name}
            </h1>
            <p className="text-sm text-gray-500">{profile.headline || "Freelancer"}</p>
          </div>
        </div>
        <Link
          href={`/freelancers/${profile.slug}`}
          target="_blank"
          className="btn-secondary text-sm inline-flex items-center gap-1.5"
        >
          <Eye className="w-4 h-4" /> Ver perfil público
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.badge ? (
              <span className="ml-1.5 text-xs bg-red-500 text-white rounded-full px-1.5">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "perfil" && <ProfileTab profile={profile} />}
      {tab === "servicios" && <ServicesTab services={data.services} defaultCurrency={profile.currency} />}
      {tab === "portfolio" && <PortfolioTab items={data.portfolio} />}
      {tab === "pagos" && <PaymentsTab links={data.payment_links} />}
      {tab === "presupuestos" && <QuotesTab quotes={data.quotes} />}
    </div>
  );
}

function useSaver() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okText = "Guardado") {
    setMsg(null);
    start(async () => {
      const res = await fn();
      setMsg(res.ok ? { ok: true, text: okText } : { ok: false, text: res.error ?? "Error" });
      if (res.ok) setTimeout(() => setMsg(null), 2500);
    });
  }
  return { pending, msg, run };
}

// ── Perfil ──
function ProfileTab({ profile }: { profile: FreelancerWithIdentity }) {
  const { pending, msg, run } = useSaver();
  const bannerInput = useRef<HTMLInputElement>(null);
  const [banner, setBanner] = useState(profile.banner_url);
  const [f, setF] = useState({
    headline: profile.headline,
    bio: profile.bio,
    category: profile.category,
    skills: profile.skills.join(", "),
    languages: profile.languages.join(", "),
    hourly_rate: profile.hourly_rate?.toString() ?? "",
    currency: profile.currency,
    availability: profile.availability,
    years_experience: profile.years_experience?.toString() ?? "",
    location_city: profile.location_city,
    website_url: profile.website_url ?? "",
    linkedin_url: profile.linkedin_url ?? "",
    instagram_url: profile.instagram_url ?? "",
    github_url: profile.github_url ?? "",
    behance_url: profile.behance_url ?? "",
    accent_color: profile.accent_color,
    is_public: profile.is_public,
  });

  function save() {
    run(() =>
      updateFreelancerProfile({
        headline: f.headline,
        bio: f.bio,
        category: f.category,
        skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
        languages: f.languages.split(",").map((s) => s.trim()).filter(Boolean),
        hourly_rate: f.hourly_rate ? Number(f.hourly_rate) : null,
        currency: f.currency,
        availability: f.availability,
        years_experience: f.years_experience ? Number(f.years_experience) : null,
        location_city: f.location_city,
        website_url: f.website_url || null,
        linkedin_url: f.linkedin_url || null,
        instagram_url: f.instagram_url || null,
        github_url: f.github_url || null,
        behance_url: f.behance_url || null,
        accent_color: f.accent_color,
        is_public: f.is_public,
      })
    );
  }

  async function onBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, { maxSize: 1600 });
    const fd = new FormData();
    fd.set("image", compressed);
    fd.set("kind", "banner");
    const res = await uploadFreelancerImage(fd);
    if (res.ok && res.url) setBanner(res.url);
  }

  return (
    <div className="space-y-4">
      {/* Banner + personalización */}
      <div className="card overflow-hidden">
        <div
          className="h-24 bg-cover bg-center"
          style={{
            background: banner
              ? `url(${banner}) center/cover`
              : `linear-gradient(135deg, ${f.accent_color}, ${f.accent_color}99)`,
          }}
        />
        <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => bannerInput.current?.click()}
            className="btn-secondary text-sm inline-flex items-center gap-1.5"
          >
            <ImageIcon className="w-4 h-4" /> Cambiar banner
          </button>
          <input
            ref={bannerInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onBanner}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Color</span>
            {ACCENTS.map((c) => (
              <button
                key={c}
                onClick={() => setF({ ...f, accent_color: c })}
                className="w-6 h-6 rounded-full border-2"
                style={{
                  background: c,
                  borderColor: f.accent_color === c ? "#111" : "transparent",
                }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <Field label="Titular (una línea)">
          <input
            className="input"
            placeholder="Ej: Diseñador UX/UI · +5 años"
            value={f.headline}
            onChange={(e) => setF({ ...f, headline: e.target.value })}
          />
        </Field>
        <Field label="Sobre mí">
          <textarea
            className="input min-h-[110px]"
            placeholder="Contá tu historia, en qué te especializás y cómo trabajás."
            value={f.bio}
            onChange={(e) => setF({ ...f, bio: e.target.value })}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Categoría">
            <select
              className="input"
              value={f.category}
              onChange={(e) => setF({ ...f, category: e.target.value })}
            >
              {FREELANCER_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Ciudad">
            <input
              className="input"
              value={f.location_city}
              onChange={(e) => setF({ ...f, location_city: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Habilidades (separadas por coma)">
          <input
            className="input"
            placeholder="Figma, React, Branding"
            value={f.skills}
            onChange={(e) => setF({ ...f, skills: e.target.value })}
          />
        </Field>
        <Field label="Idiomas (separados por coma)">
          <input
            className="input"
            placeholder="Español, Inglés"
            value={f.languages}
            onChange={(e) => setF({ ...f, languages: e.target.value })}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Tarifa/hora">
            <input
              className="input"
              type="number"
              placeholder="A convenir"
              value={f.hourly_rate}
              onChange={(e) => setF({ ...f, hourly_rate: e.target.value })}
            />
          </Field>
          <Field label="Moneda">
            <select
              className="input"
              value={f.currency}
              onChange={(e) => setF({ ...f, currency: e.target.value })}
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Años de exp.">
            <input
              className="input"
              type="number"
              value={f.years_experience}
              onChange={(e) => setF({ ...f, years_experience: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Disponibilidad">
          <select
            className="input"
            value={f.availability}
            onChange={(e) =>
              setF({ ...f, availability: e.target.value as typeof f.availability })
            }
          >
            <option value="disponible">Disponible</option>
            <option value="ocupado">Ocupado</option>
            <option value="no_disponible">No disponible</option>
          </select>
        </Field>
      </div>

      {/* Redes */}
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-primary-dark">Enlaces</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["website_url", "Sitio web"],
              ["linkedin_url", "LinkedIn"],
              ["instagram_url", "Instagram"],
              ["github_url", "GitHub"],
              ["behance_url", "Behance"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                className="input"
                placeholder="https://…"
                value={f[key]}
                onChange={(e) => setF({ ...f, [key]: e.target.value })}
              />
            </Field>
          ))}
        </div>
      </div>

      {/* Visibilidad */}
      <label className="card p-4 flex items-center justify-between cursor-pointer">
        <div>
          <p className="font-medium text-primary-dark">Perfil público</p>
          <p className="text-sm text-gray-500">
            Aparecé en el directorio y permití que te encuentren.
          </p>
        </div>
        <input
          type="checkbox"
          checked={f.is_public}
          onChange={(e) => setF({ ...f, is_public: e.target.checked })}
          className="w-5 h-5"
        />
      </label>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        {msg && (
          <span className={`text-sm ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

// ── Servicios ──
function ServicesTab({
  services,
  defaultCurrency,
}: {
  services: FreelancerService[];
  defaultCurrency: string;
}) {
  const { pending, run } = useSaver();
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    price_from: "",
    delivery_days: "",
  });

  function add() {
    if (!draft.title.trim()) return;
    run(
      () =>
        saveFreelancerService({
          title: draft.title,
          description: draft.description,
          price_from: draft.price_from ? Number(draft.price_from) : null,
          currency: defaultCurrency,
          delivery_days: draft.delivery_days ? Number(draft.delivery_days) : null,
        }),
      "Servicio agregado"
    );
    setDraft({ title: "", description: "", price_from: "", delivery_days: "" });
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-primary-dark">Nuevo servicio</h3>
        <input
          className="input"
          placeholder="Título (ej: Diseño de logo profesional)"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <textarea
          className="input"
          placeholder="Qué incluye"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            type="number"
            placeholder="Precio desde"
            value={draft.price_from}
            onChange={(e) => setDraft({ ...draft, price_from: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Días de entrega"
            value={draft.delivery_days}
            onChange={(e) => setDraft({ ...draft, delivery_days: e.target.value })}
          />
        </div>
        <button onClick={add} disabled={pending} className="btn-primary inline-flex items-center gap-1.5 disabled:opacity-60">
          <Plus className="w-4 h-4" /> Agregar servicio
        </button>
      </div>

      {services.map((s) => (
        <div key={s.id} className="card p-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-primary-dark">{s.title}</p>
            {s.description && <p className="text-sm text-gray-500">{s.description}</p>}
            <p className="text-sm mt-1 text-gray-600">
              {formatPrice(s.price_from, s.currency)}
              {s.delivery_days != null && ` · ${s.delivery_days} días`}
            </p>
          </div>
          <DeleteButton onDelete={() => deleteFreelancerService(s.id)} />
        </div>
      ))}
    </div>
  );
}

// ── Portfolio ──
function PortfolioTab({ items }: { items: PortfolioItem[] }) {
  const { pending, run } = useSaver();
  const fileInput = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    link_url: "",
    role: "",
    client: "",
    year: "",
  });

  async function pickImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, { maxSize: 1600 });
    const fd = new FormData();
    fd.set("image", compressed);
    fd.set("kind", "portfolio");
    const res = await uploadFreelancerImage(fd);
    if (res.ok && res.url) setImg(res.url);
  }

  function add() {
    if (!draft.title.trim()) return;
    run(
      () =>
        savePortfolioItem({
          title: draft.title,
          description: draft.description,
          image_url: img,
          link_url: draft.link_url || null,
          role: draft.role || null,
          client: draft.client || null,
          year: draft.year ? Number(draft.year) : null,
        }),
      "Proyecto agregado"
    );
    setDraft({ title: "", description: "", link_url: "", role: "", client: "", year: "" });
    setImg(null);
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-primary-dark">Nuevo proyecto</h3>
        <div
          onClick={() => fileInput.current?.click()}
          className="h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer bg-cover bg-center text-gray-400"
          style={img ? { backgroundImage: `url(${img})` } : undefined}
        >
          {!img && (
            <span className="inline-flex items-center gap-1.5 text-sm">
              <ImageIcon className="w-4 h-4" /> Subir imagen
            </span>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={pickImg} />
        <input
          className="input"
          placeholder="Título del proyecto"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <textarea
          className="input"
          placeholder="Descripción"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-3">
          <input className="input" placeholder="Rol" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
          <input className="input" placeholder="Cliente" value={draft.client} onChange={(e) => setDraft({ ...draft, client: e.target.value })} />
          <input className="input" type="number" placeholder="Año" value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} />
        </div>
        <input
          className="input"
          placeholder="Link (https://…)"
          value={draft.link_url}
          onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
        />
        <button onClick={add} disabled={pending} className="btn-primary inline-flex items-center gap-1.5 disabled:opacity-60">
          <Plus className="w-4 h-4" /> Agregar proyecto
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((p) => (
          <div key={p.id} className="card overflow-hidden">
            {p.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt={p.title} className="w-full h-32 object-cover" />
            )}
            <div className="p-4 flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-primary-dark">{p.title}</p>
                {p.description && <p className="text-sm text-gray-500">{p.description}</p>}
              </div>
              <DeleteButton onDelete={() => deletePortfolioItem(p.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pagos ──
function PaymentsTab({ links }: { links: PaymentLink[] }) {
  const { pending, msg, run } = useSaver();
  const [draft, setDraft] = useState({ label: "", url: "" });

  function add() {
    if (!draft.label.trim() || !draft.url.trim()) return;
    run(() => savePaymentLink(draft), "Link agregado");
    setDraft({ label: "", url: "" });
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-primary-dark">Agregar link de pago</h3>
        <p className="text-sm text-gray-500">
          Pegá el link de tu método de cobro. Worka no procesa el dinero: el pago
          va directo a tu cuenta.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="input"
            placeholder="Nombre (ej: Mercado Pago)"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
          <input
            className="input"
            placeholder="https://…"
            value={draft.url}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={add} disabled={pending} className="btn-primary inline-flex items-center gap-1.5 disabled:opacity-60">
            <Plus className="w-4 h-4" /> Agregar
          </button>
          {msg && !msg.ok && <span className="text-sm text-red-600">{msg.text}</span>}
        </div>
      </div>

      {links.map((l) => (
        <div key={l.id} className="card p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-primary-dark">{l.label}</p>
            <a href={l.url} target="_blank" rel="noreferrer" className="text-sm text-primary truncate inline-flex items-center gap-1">
              {l.url} <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
          <DeleteButton onDelete={() => deletePaymentLink(l.id)} />
        </div>
      ))}
    </div>
  );
}

// ── Presupuestos ──
function QuotesTab({ quotes }: { quotes: QuoteRequest[] }) {
  const [, start] = useTransition();
  const STATUS: Record<string, { label: string; cls: string }> = {
    nuevo: { label: "Nuevo", cls: "bg-blue-100 text-blue-700" },
    respondido: { label: "Respondido", cls: "bg-amber-100 text-amber-700" },
    cerrado: { label: "Cerrado", cls: "bg-gray-100 text-gray-500" },
  };

  if (quotes.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-gray-400">
        Todavía no recibiste solicitudes de presupuesto.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quotes.map((q) => (
        <div key={q.id} className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-primary-dark">{q.name}</p>
              <a href={`mailto:${q.email}`} className="text-sm text-primary">
                {q.email}
              </a>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS[q.status]?.cls}`}>
              {STATUS[q.status]?.label}
            </span>
          </div>
          {q.budget && (
            <p className="text-sm text-gray-500 mt-2">Presupuesto: {q.budget}</p>
          )}
          <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{q.message}</p>
          <div className="flex gap-2 mt-3">
            {q.status !== "respondido" && (
              <button
                onClick={() => start(() => void setQuoteStatus(q.id, "respondido"))}
                className="text-xs btn-secondary"
              >
                Marcar respondido
              </button>
            )}
            {q.status !== "cerrado" && (
              <button
                onClick={() => start(() => void setQuoteStatus(q.id, "cerrado"))}
                className="text-xs btn-secondary inline-flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Cerrar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => Promise<unknown> }) {
  const [, start] = useTransition();
  return (
    <button
      onClick={() => start(() => void onDelete())}
      className="text-gray-300 hover:text-red-500 shrink-0"
      aria-label="Borrar"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
