"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { CITIES } from "@/lib/mock-data";
import { registerCompany, signUpWithEmail } from "@/app/actions";
import { validateRucFormat } from "@/lib/ruc";

export default function CompanyRegisterPage() {
  const [sent, setSent] = useState<null | "demo" | "confirm" | "ok">(null);
  const [companyName, setCompanyName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [ruc, setRuc] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      await registerCompany({
        company_name: companyName,
        trade_name: tradeName,
        ruc,
        location_city: city,
      });
      setSent("confirm");
    });
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div className="text-center">
          <Logo />
          <h1 className="text-lg font-bold text-primary-dark mt-2">
            Registrá tu empresa
          </h1>
          <p className="text-sm text-gray-500">
            Publicar vacantes es gratis. Verificamos el RUC de cada empresa para
            proteger a los candidatos.
          </p>
        </div>

        {sent ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-4xl">📨</p>
            <p className="font-semibold text-primary-dark">
              ¡Solicitud enviada!
            </p>
            <p className="text-sm text-gray-500">
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
              <label className="label">RUC *</label>
              <input
                className="input"
                placeholder="Ej: 80012345-6"
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
              />
              {ruc.length >= 6 &&
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
              <label className="label">Ciudad *</label>
              <select
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">Elegí la ciudad</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
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

            {error && (
              <p className="text-sm text-danger text-center">{error}</p>
            )}

            <button
              className="btn-primary w-full"
              disabled={
                pending ||
                !companyName ||
                !tradeName ||
                !ruc ||
                !validateRucFormat(ruc).valid ||
                !city ||
                !email ||
                !password
              }
              onClick={submit}
            >
              {pending ? "Enviando…" : "Crear cuenta de empresa"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
