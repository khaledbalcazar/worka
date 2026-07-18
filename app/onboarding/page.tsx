"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { CITIES, INDUSTRIES } from "@/lib/mock-data";
import {
  completeOnboarding,
  requestPhoneCode,
  verifyPhoneCode,
} from "@/app/actions";

// Onboarding del candidato: contacto → verificación de WhatsApp → CV
// (PDF con parsing) o formulario manual → preferencias.
type Step =
  | "contacto"
  | "verificar"
  | "cv"
  | "parsing"
  | "manual"
  | "preferencias"
  | "listo";

function ErrorNote({ error }: { error: string }) {
  return (
    <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">
      {error}{" "}
      {error.includes("sesión") || error.includes("Iniciá") ? (
        <Link href="/ingresar?next=/onboarding" className="underline font-medium">
          Ingresar
        </Link>
      ) : null}
    </p>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("contacto");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [detected, setDetected] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [firstJob, setFirstJob] = useState(false);
  const [code, setCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startVerification() {
    setStep("verificar");
    // En producción, esto dispara el envío del código por WhatsApp.
    requestPhoneCode();
  }

  function checkCode() {
    setError(null);
    startTransition(async () => {
      const result = await verifyPhoneCode(code);
      // En modo demo también validamos el código de prueba para simular el flujo real.
      if (result.demo && code.trim() !== "123456") {
        setError("Código incorrecto. Revisá tu WhatsApp.");
        return;
      }
      if (!result.ok) {
        setError(result.error ?? "Código incorrecto.");
        return;
      }
      setPhoneVerified(true);
      setStep("cv");
    });
  }

  function finish() {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({
        full_name: name,
        phone_whatsapp: phone,
        phone_verified: phoneVerified,
        location_city: city,
        preferences_industry: selectedIndustries,
        first_job_mode: firstJob,
      });
      if (result.ok) setStep("listo");
      else setError(result.error ?? "Ocurrió un error.");
    });
  }

  function simulateParsing() {
    setStep("parsing");
    // En producción: función serverless extrae texto del PDF y detecta rubros.
    setTimeout(() => {
      const found = ["Ventas", "Atención al Cliente"];
      setDetected(found);
      setSelectedIndustries(found);
      setStep("preferencias");
    }, 1800);
  }

  function toggleIndustry(ind: string) {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  }

  const stepNumber =
    step === "contacto"
      ? 1
      : step === "verificar"
        ? 2
        : step === "cv" || step === "parsing"
          ? 3
          : 4;

  return (
    <main className="flex-1 w-full sm:max-w-md sm:mx-auto bg-white min-h-screen flex flex-col">
      <header className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <Logo />
        {step !== "listo" && (
          <span className="text-xs text-gray-400">Paso {stepNumber} de 4</span>
        )}
      </header>

      <div className="flex-1 px-4 py-6">
        {step === "contacto" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-primary-dark">
                ¡Bienvenido/a a Worka! 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Dos datos y ya podés empezar a postularte.
              </p>
            </div>
            <div>
              <label className="label">Tu nombre completo</label>
              <input
                className="input"
                placeholder="Ej: María González"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Tu número de WhatsApp</label>
              <input
                className="input"
                type="tel"
                placeholder="Ej: 0981 234 567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Las empresas te contactan por acá. No lo compartimos con nadie
                más.
              </p>
            </div>
            <div>
              <label className="label">¿En qué ciudad vivís?</label>
              <select
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">Elegí tu ciudad</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              className="btn-primary w-full text-base"
              disabled={!name || !phone || !city}
              onClick={startVerification}
            >
              Continuar
            </button>
          </div>
        )}

        {step === "verificar" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-primary-dark">
                Verificá tu WhatsApp 📲
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Te enviamos un código de 6 dígitos al{" "}
                <span className="font-medium text-gray-700">{phone}</span>. Así
                las empresas saben que detrás de cada postulación hay una
                persona real.
              </p>
            </div>
            <input
              className="input text-center text-2xl tracking-[0.5em] font-bold"
              inputMode="numeric"
              maxLength={6}
              placeholder="······"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && code.length === 6 && checkCode()}
            />
            <p className="text-xs text-gray-400 text-center">
              Código de prueba mientras conectamos WhatsApp:{" "}
              <span className="font-mono font-semibold">123456</span>
            </p>
            {error && <ErrorNote error={error} />}
            <button
              className="btn-primary w-full text-base"
              disabled={code.length !== 6 || pending}
              onClick={checkCode}
            >
              {pending ? "Verificando…" : "Verificar mi número"}
            </button>
            <div className="flex justify-between text-sm">
              <button
                className="text-gray-400"
                onClick={() => setStep("contacto")}
              >
                ← Cambiar número
              </button>
              <button
                className="text-primary font-medium"
                onClick={() => requestPhoneCode()}
              >
                Reenviar código
              </button>
            </div>
          </div>
        )}

        {step === "cv" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-primary-dark">
                ¿Tenés CV?
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Si lo subís, completamos tu perfil automáticamente. Si no,
                tranquilo/a: lo armamos juntos en 1 minuto.
              </p>
            </div>
            <button
              className="card w-full p-5 text-left hover:border-primary border-2 border-transparent"
              onClick={simulateParsing}
            >
              <p className="text-2xl mb-1">📄</p>
              <p className="font-semibold text-primary-dark">Subir mi CV (PDF)</p>
              <p className="text-sm text-gray-500">
                Leemos tu CV y detectamos tus rubros automáticamente.
              </p>
            </button>
            <button
              className="card w-full p-5 text-left hover:border-primary border-2 border-transparent"
              onClick={() => setStep("manual")}
            >
              <p className="text-2xl mb-1">✍️</p>
              <p className="font-semibold text-primary-dark">No tengo CV</p>
              <p className="text-sm text-gray-500">
                Respondé unas preguntas y Worka te genera un CV gratis.
              </p>
            </button>
          </div>
        )}

        {step === "parsing" && (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-semibold text-primary-dark">Leyendo tu CV…</p>
            <p className="text-sm text-gray-500">
              Detectando tu experiencia y rubros de interés.
            </p>
          </div>
        )}

        {step === "manual" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-primary-dark">
                Contanos de vos
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                ¿En qué rubros te gustaría trabajar?
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() => toggleIndustry(ind)}
                  className={`chip min-h-10 px-4 ${
                    selectedIndustries.includes(ind)
                      ? "bg-primary text-white"
                      : "bg-surface text-gray-600"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 cursor-pointer card p-4">
              <input
                type="checkbox"
                checked={firstJob}
                onChange={(e) => setFirstJob(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  ✨ Estoy buscando mi primer empleo
                </p>
                <p className="text-xs text-gray-500">
                  Te mostramos solo vacantes que no piden experiencia.
                </p>
              </div>
            </label>
            {error && <ErrorNote error={error} />}
            <button
              className="btn-primary w-full text-base"
              disabled={selectedIndustries.length === 0 || pending}
              onClick={finish}
            >
              {pending ? "Creando…" : "Crear mi perfil"}
            </button>
          </div>
        )}

        {step === "preferencias" && (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="font-semibold text-emerald-700">
                ✅ ¡Leímos tu CV!
              </p>
              <p className="text-sm text-emerald-600 mt-0.5">
                Detectamos estos rubros: {detected.join(", ")}. Podés ajustarlos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() => toggleIndustry(ind)}
                  className={`chip min-h-10 px-4 ${
                    selectedIndustries.includes(ind)
                      ? "bg-primary text-white"
                      : "bg-surface text-gray-600"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
            {error && <ErrorNote error={error} />}
            <button
              className="btn-primary w-full text-base"
              disabled={selectedIndustries.length === 0 || pending}
              onClick={finish}
            >
              {pending ? "Creando…" : "Confirmar y crear mi perfil"}
            </button>
          </div>
        )}

        {step === "listo" && (
          <div className="text-center py-12 space-y-3 animate-pop">
            <p className="text-5xl">🎉</p>
            <h1 className="text-xl font-bold text-primary-dark">
              ¡Tu perfil está listo!
            </h1>
            <p className="text-sm text-gray-500">
              WhatsApp verificado ✓. Ya podés postularte con 1 clic y te
              avisamos cuando una empresa vea tu perfil.
            </p>
            <div className="card p-4 text-left bg-blue-50 border-blue-100 mt-4">
              <p className="text-sm font-semibold text-primary-dark">
                ✨ Un regalo de bienvenida
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Con los datos de tu perfil ya podemos generarte un CV
                profesional en PDF, gratis.
              </p>
              <button
                className="btn-primary w-full mt-3"
                onClick={() => router.push("/cv")}
              >
                📄 Generar mi CV gratis
              </button>
            </div>
            <button
              className="btn-secondary w-full text-base"
              onClick={() => router.push("/empleos")}
            >
              Ver empleos para mí
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
