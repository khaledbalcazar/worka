"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Crown, Gift, Mail } from "lucide-react";
import { useCountryCookie } from "@/lib/useCountryCookie";
import { registerCompany, signUpWithEmail } from "@/app/actions";
import { validateRucFormat } from "@/lib/ruc";
import { ENTERPRISE_BRAND } from "@/lib/plans";
import { LAUNCH_PROMO, isPromoOpen, isValidPromoCode, normalizePromoCode } from "@/lib/promo";

export default function CompanyRegisterPage() {
  const [sent, setSent] = useState<null | "demo" | "confirm" | "ok">(null);
  const [companyName, setCompanyName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [ruc, setRuc] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [promo, setPromo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // El código llega desde la página de la oferta (?promo=WORKA3PRO).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("promo");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- la URL se lee después de montar
    if (fromUrl) setPromo(normalizePromoCode(fromUrl));
  }, []);
  const promoTyped = normalizePromoCode(promo);
  const promoOk = isValidPromoCode(promoTyped);

  const country = useCountryCookie();

  function submit() {
    setError(null);
    startTransition(async () => {
      // Los datos de la empresa viajan en el metadata del alta: un trigger en
      // la base crea el perfil y la empresa aunque el email se confirme después.
      const signUp = await signUpWithEmail(email, password, {
        worka_role: "company",
        company_name: companyName,
        trade_name: tradeName,
        ruc,
        location_city: city,
        worka_country: country.code,
        // Se canjea en el primer ingreso (ver lib/promo-server.ts).
        ...(promoOk ? { worka_promo: promoTyped } : {}),
      });
      if (signUp.demo) {
        setSent("demo");
        return;
      }
      if (!signUp.ok) {
        setError(signUp.error ?? "No pudimos crear la cuenta.");
        return;
      }
      // Por si la confirmación de email está desactivada y ya hay sesión:
      const registered = await registerCompany({
        company_name: companyName,
        trade_name: tradeName,
        ruc,
        location_city: city,
        country: country.code,
      });
      if (registered.promo) {
        router.push("/empresa?bienvenida=promo");
        return;
      }
      setSent("confirm");
    });
  }

  return (
    <div className="flex flex-col items-center sm:py-6">
      <div className="w-full max-w-[520px] bg-white rounded-lg border border-line shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-6 sm:p-9 space-y-4">
        <div>
          <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.01em]">
            Registrá tu empresa
          </h1>
          <p className="text-[15px] text-muted mt-2">
            Publicar vacantes es gratis. Verificamos el RUC de cada empresa para
            proteger a los candidatos.
          </p>
        </div>

        {promoOk && !sent && (
          <div className="flex gap-3 rounded-lg border border-[#c9d9ea] bg-[#f3f8fd] p-3.5">
            <span className="w-9 h-9 rounded-full bg-primary text-white grid place-items-center shrink-0">
              <Crown size={17} />
            </span>
            <div className="text-sm">
              <p className="font-semibold">3 meses de {ENTERPRISE_BRAND} + Worka Evaluar sin costo</p>
              <p className="text-muted mt-0.5">Se activan solos al confirmar tu email. Sin tarjeta.</p>
            </div>
          </div>
        )}

        {sent ? (
          <div className="text-center py-6 space-y-2" role="status">
            <span className="confirmation-icon mx-auto"><Mail size={26} /></span>
            <p className="text-xl font-semibold">
              Solicitud enviada
            </p>
            {promoOk && (
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-success-ink bg-[#e9f4ec] rounded-full px-3 py-1">
                <Gift size={15} /> Código {promoTyped} guardado
              </p>
            )}
            <p className="text-sm text-gray-500">
              {promoOk && sent === "confirm" && `Al confirmar tu email activamos ${ENTERPRISE_BRAND} · Pro y Worka Evaluar · Profesional por 3 meses. `}
              {sent === "confirm"
                ? "Revisá tu email y hacé clic en el link de confirmación: te lleva directo a tu panel de empresa. Mientras tanto verificamos tu RUC."
                : "Vamos a verificar tu RUC contra el registro público de la DNIT. Te avisamos por email en menos de 24 horas."}
            </p>
            <Link href="/ingresar?next=/empresa" className="btn-primary w-full mt-3">
              Ya confirmé — Ingresar
            </Link>
          </div>
        ) : (
          <>
            <div>
              <label className="label">Razón Social *</label>
              <input
                className="input"
                placeholder="Ej: Comercial San Jorge S.A."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Nombre de Fantasía *</label>
              <input
                className="input"
                placeholder="Ej: San Jorge"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{country.taxIdLabel} *</label>
              <input
                className="input"
                placeholder={
                  country.code === "py" ? "Ej: 80012345-6" : "Número fiscal"
                }
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
              />
              {/* La validación del dígito verificador es específica de Paraguay.
                  En otros países se contrasta manualmente. */}
              {country.code === "py" &&
                ruc.length >= 6 &&
                (() => {
                  const check = validateRucFormat(ruc);
                  return (
                    <p
                      className={`text-xs mt-1 ${
                        check.valid ? "text-emerald-600" : "text-danger"
                      }`}
                    >
                      {check.valid
                        ? "✓ Dígito verificador correcto. El contraste final con la DNIT lo hace nuestro equipo."
                        : `✕ ${check.reason}`}
                    </p>
                  );
                })()}
            </div>
            <div>
              <label className="label">
                Ciudad en {country.flag} {country.name} *
              </label>
              <select
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">Elegí la ciudad</option>
                {country.cities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
                <option value="Otra">Otra ciudad</option>
              </select>
            </div>
            <div>
              <label className="label">Email de contacto *</label>
              <input
                className="input"
                type="email"
                placeholder="rrhh@tuempresa.com.py"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Contraseña *</label>
              <input
                className="input"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {isPromoOpen() && (
              <div>
                <label className="label" htmlFor="promo">Código promocional <span className="font-normal text-muted">(opcional)</span></label>
                <input
                  id="promo"
                  className="input font-mono tracking-[.08em] uppercase"
                  placeholder={`Ej: ${LAUNCH_PROMO.code}`}
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  autoComplete="off"
                />
                {promoTyped && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${promoOk ? "text-emerald-600" : "text-danger"}`}>
                    {promoOk ? <><Check size={13} /> Código válido: 3 meses de {ENTERPRISE_BRAND} · Pro y Worka Evaluar.</> : "✕ Ese código no es válido."}
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-danger text-center bg-red-50 rounded-xl px-4 py-3">
                {String(error)}
              </p>
            )}

            <button
              className="btn-primary w-full"
              disabled={
                pending ||
                !companyName ||
                !tradeName ||
                !ruc ||
                (country.code === "py" && !validateRucFormat(ruc).valid) ||
                !city ||
                !email ||
                !password ||
                (promoTyped !== "" && !promoOk)
              }
              onClick={submit}
            >
              {pending ? "Enviando…" : "Crear cuenta de empresa"}
            </button>
          </>
        )}
      </div>
      {!sent && (
        <p className="text-[15px] mt-6 text-center">
          ¿Tu empresa ya tiene cuenta?{" "}
          <Link href="/ingresar/empresa" className="text-primary font-semibold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      )}
    </div>
  );
}
