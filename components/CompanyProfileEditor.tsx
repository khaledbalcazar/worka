"use client";

import { useRef, useState, useTransition } from "react";
import type {
  Company,
  CompanyMember,
  CompanyPost,
  ResolvedBadge,
} from "@/lib/types";
import { BADGE_CATALOG } from "@/lib/types";
import { FastResponderBadge, VerifiedBadge } from "@/components/Badges";
import {
  createCompanyPost,
  inviteTeamMember,
  removeTeamMember,
  updateCompanyProfile,
  uploadCompanyImage,
} from "@/app/actions";
import { compressImage } from "@/lib/compress-image";
import { timeAgo } from "@/lib/format";

export default function CompanyProfileEditor({
  company,
  posts: initialPosts,
  members: initialMembers = [],
  earnedCustomBadges = [],
}: {
  company: Company;
  posts: CompanyPost[];
  members?: CompanyMember[];
  earnedCustomBadges?: ResolvedBadge[];
}) {
  const [tradeName, setTradeName] = useState(company.trade_name);
  const [description, setDescription] = useState(company.description ?? "");
  const [website, setWebsite] = useState(company.website_url ?? "");
  const [instagram, setInstagram] = useState(company.instagram_url ?? "");
  const [facebook, setFacebook] = useState(company.facebook_url ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(
    company.logo_url
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    company.banner_url
  );
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState("");
  const [members, setMembers] = useState(initialMembers);
  const [inviteEmail, setInviteEmail] = useState("");

  function invite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    startTransition(async () => {
      const result = await inviteTeamMember(email);
      if (!result.ok) {
        flash(result.error ?? "No pudimos invitar.");
        return;
      }
      setMembers((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          company_id: company.id,
          email,
          member_id: null,
          status: "invitada" as const,
          created_at: new Date().toISOString(),
        },
      ]);
      setInviteEmail("");
      flash(
        `📨 Invitación registrada. Cuando ${email} cree su cuenta (o ingrese) con ese email, accede automáticamente a este panel.`
      );
    });
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    startTransition(() => {
      removeTeamMember(id);
    });
  }
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const logoInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 5000);
  }

  // Sube la imagen a Storage (con preview inmediato mientras carga).
  function uploadImage(file: File | undefined, kind: "logo" | "banner") {
    if (!file) return;
    const set = kind === "logo" ? setLogoPreview : setBannerPreview;
    const reader = new FileReader();
    reader.onload = () => set(reader.result as string);
    reader.readAsDataURL(file);

    startTransition(async () => {
      // Logo más chico (cuadrado), banner más ancho. Ambos comprimidos.
      const compressed = await compressImage(file, {
        maxSize: kind === "logo" ? 512 : 1600,
      });
      const fd = new FormData();
      fd.append("image", compressed);
      const result = await uploadCompanyImage(fd, kind);
      if (result.ok) {
        if (result.url) set(result.url);
        flash(kind === "logo" ? "✅ Logo actualizado." : "✅ Banner actualizado.");
      } else {
        flash(result.error ?? "No pudimos subir la imagen.");
      }
    });
  }

  function saveProfile() {
    startTransition(async () => {
      const result = await updateCompanyProfile({
        trade_name: tradeName,
        description,
        website_url: website || null,
        instagram_url: instagram || null,
        facebook_url: facebook || null,
      });
      flash(
        result.ok
          ? "✅ Cambios guardados. Así se ve tu página pública."
          : result.error ?? "No pudimos guardar."
      );
    });
  }

  function publishPost() {
    const content = newPost.trim();
    if (!content) return;
    startTransition(async () => {
      const result = await createCompanyPost(content);
      if (!result.ok) {
        flash(result.error ?? "No pudimos publicar.");
        return;
      }
      setPosts((prev) => [
        {
          id: `local-${Date.now()}`,
          company_id: company.id,
          content,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setNewPost("");
      flash("📣 Novedad publicada en tu página pública.");
    });
  }

  const earned = new Set(company.badges);

  return (
    <div className="max-w-4xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Perfil de empresa
        </h1>
        <p className="text-sm text-gray-500">
          Así te ven los candidatos. Un perfil completo genera más y mejores
          postulaciones.
        </p>
      </div>

      {notice && (
        <div className="card px-5 py-3 bg-emerald-50 border-emerald-100 text-sm text-emerald-800 animate-fade-up">
          {notice}
        </div>
      )}

      {/* Banner + logo */}
      <section className="card overflow-hidden">
        <button
          className="relative w-full h-36 sm:h-44 bg-gradient-to-r from-primary-dark to-primary group"
          onClick={() => bannerInput.current?.click()}
          style={
            bannerPreview
              ? {
                  backgroundImage: `url(${bannerPreview})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors text-white text-sm font-medium opacity-0 group-hover:opacity-100">
            🖼️ Cambiar banner
          </span>
        </button>
        <input
          ref={bannerInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadImage(e.target.files?.[0], "banner")}
        />
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10">
            <button
              className="relative w-20 h-20 rounded-2xl border-4 border-white bg-blue-50 text-primary flex items-center justify-center text-2xl font-bold shadow group overflow-hidden"
              onClick={() => logoInput.current?.click()}
            >
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                company.trade_name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
              )}
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-all">
                Cambiar
              </span>
            </button>
            <input
              ref={logoInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadImage(e.target.files?.[0], "logo")}
            />
            <div className="flex items-center gap-2 pb-1">
              {company.is_verified && <VerifiedBadge />}
              {company.fast_responder && <FastResponderBadge />}
            </div>
          </div>
          <h2 className="font-bold text-primary-dark text-lg mt-3">
            {tradeName}
          </h2>
          <p className="text-sm text-gray-500">
            {company.company_name} · {company.location_city}
          </p>
        </div>
      </section>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0 items-start">
        {/* Datos */}
        <section className="card p-5 space-y-4">
          <h2 className="font-semibold text-primary-dark">Datos públicos</h2>
          <div>
            <label className="label">Nombre de fantasía</label>
            <input
              className="input"
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input min-h-28"
              placeholder="Contá quiénes son, cuánta gente trabaja y por qué está bueno trabajar ahí…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="label">RUC</label>
            <input className="input bg-surface" value={company.ruc} disabled />
            <p
              className={`text-xs mt-1 ${
                company.is_verified ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {company.is_verified
                ? "✓ Verificado contra el registro de la DNIT"
                : "⏳ Verificación de RUC en proceso"}
            </p>
          </div>
          <div className="space-y-3">
            <p className="label mb-0">Enlaces</p>
            <input
              className="input"
              placeholder="🌐 Sitio web (https://…)"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <input
              className="input"
              placeholder="📸 Instagram (https://instagram.com/…)"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
            <input
              className="input"
              placeholder="👍 Facebook (https://facebook.com/…)"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
            />
          </div>
          <button
            className="btn-primary w-full"
            onClick={saveProfile}
            disabled={pending}
          >
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
        </section>

        <div className="space-y-6">
          {/* Novedades */}
          <section className="card p-5 space-y-3">
            <h2 className="font-semibold text-primary-dark">
              📣 Novedades de la empresa
            </h2>
            <p className="text-xs text-gray-400 -mt-1">
              Publicaciones cortas que los candidatos ven en tu página pública:
              nuevas sucursales, ascensos, próximas búsquedas…
            </p>
            <textarea
              className="input min-h-20"
              maxLength={500}
              placeholder="¿Qué está pasando en tu empresa?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {newPost.length}/500
              </span>
              <button
                className="btn-primary"
                disabled={!newPost.trim() || pending}
                onClick={publishPost}
              >
                Publicar
              </button>
            </div>
            <div className="space-y-2 pt-1">
              {posts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-3">
                  Todavía no publicaste novedades.
                </p>
              )}
              {posts.map((p) => (
                <div key={p.id} className="bg-surface rounded-xl px-4 py-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {p.content}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {timeAgo(p.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Insignias */}
          <section className="card p-5">
            <h2 className="font-semibold text-primary-dark mb-3">
              👥 Equipo de reclutamiento
            </h2>
            <p className="text-xs text-gray-400 -mt-2 mb-3">
              Invitá a otras personas de tu empresa: acceden a este panel con
              su propia cuenta (candidatos, kanban, mensajes).
            </p>
            <div className="flex gap-2 mb-3">
              <input
                className="input flex-1"
                type="email"
                placeholder="email@tuempresa.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && invite()}
              />
              <button
                className="btn-primary shrink-0"
                disabled={!inviteEmail.trim() || pending}
                onClick={invite}
              >
                Invitar
              </button>
            </div>
            <div className="space-y-2 mb-5">
              {members.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">
                  Todavía no invitaste a nadie.
                </p>
              )}
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 bg-surface rounded-xl px-4 py-2.5"
                >
                  <p className="text-sm text-gray-700 truncate">{m.email}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`chip ${
                        m.status === "activa"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {m.status === "activa" ? "✓ activa" : "⏳ invitada"}
                    </span>
                    <button
                      className="text-xs text-gray-400 hover:text-danger"
                      onClick={() => removeMember(m.id)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="font-semibold text-primary-dark">🏅 Insignias</h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">
              Se desbloquean con tu actividad en Worka y aparecen en todas tus
              vacantes.
            </p>
            <div className="space-y-2">
              {BADGE_CATALOG.map((badge) => {
                const has = earned.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex items-start gap-3 rounded-xl px-3 py-2.5 border ${
                      has
                        ? "bg-amber-50/60 border-amber-200"
                        : "bg-surface border-transparent opacity-60"
                    }`}
                  >
                    <span className="text-xl" aria-hidden>
                      {has ? badge.emoji : "🔒"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {badge.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
              {earnedCustomBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start gap-3 rounded-xl px-3 py-2.5 border bg-amber-50/60 border-amber-200"
                >
                  <span className="text-xl" aria-hidden>
                    {badge.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {badge.label}
                    </p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
