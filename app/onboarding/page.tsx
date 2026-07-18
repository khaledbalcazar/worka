"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { CITIES, INDUSTRIES } from "@/lib/mock-data";
import {
  completeOnboarding,
  uploadAvatar,
  uploadCv,
} from "@/app/actions";
import { compressImage } from "@/lib/compress-image";

// Onboarding del candidato, 100% funcional:
// contacto → CV (subida real o elección manual) → foto y bio → rubros → listo.
// La verificación de la cuenta es por email (link de confirmación de Supabase).
type Step = "contacto" | "cv" | "perfil" | "preferencias" | "listo";

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
  const [cvUploaded, setCvUploaded] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [firstJob, setFirstJob] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const cvInput = useRef<HTMLInputElement>(null);
  const avatarInput = useRef<HTMLInputElement>(null);

  // Subida REAL del CV al bucket privado. Después, la persona elige sus
  // rubros manualmente (la lectura automática del PDF llega más adelante).
  function handleCvFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setCvUploading(true);
    const fd = new FormData();
    fd.append("cv", file);
    startTransition(async () => {
      const result = await uploadCv(fd);
      setCvUploading(false);
      if (result.ok) {
        setCvUploaded(true);
        setStep("perfil");
      } else {
        setError(result.error ?? "No pudimos subir el CV.");
      }
    });
  }

  function handleAvatar(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    startTransition(async () => {
      const compressed = await compressImage(file, { maxSize: 512 });
      const fd = new FormData();
      fd.append("image", compressed);
      const result = await uploadAvatar(fd);
      if (result.ok && result.url) setAvatarPreview(result.url);
    });
  }

  function finish() {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({
        full_name: name,
        phone_whatsapp: phone,
        location_city: city,
        preferences_industry: selectedIndustries,
        first_job_mode: firstJob,
        bio: bio || undefined,
      });
      if (result.ok) setStep("listo");
      else setError(result.error ?? "Ocurrió un error.");
    });
  }

  function toggleIndustry(ind: string) {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  }

  const stepNumber =
    step === "contacto" ? 1 : step === "cv" ? 2 : step === "perfil" ? 3 : 4;

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
                Unos datos y ya podés empezar a postularte.
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
              onClick={() => setStep("cv")}
            >
              Continuar
            </button>
          </div>
        )}

        {step === "cv" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-primary-dark">
                ¿Tenés CV?
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Si lo subís (PDF), queda guardado y viaja con cada postulación.
                Si no, tranquilo/a: Worka te genera uno gratis.
              </p>
            </div>
            <input
              ref={cvInput}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleCvFile(e.target.files?.[0])}
            />
            <button
              className="card w-full p-5 text-left hover:border-primary border-2 border-transparent disabled:opacity-60"
              disabled={cvUploading || pending}
              onClick={() => cvInput.current?.click()}
            >
              <p className="text-2xl mb-1">📄</p>
              <p className="font-semibold text-primary-dark">
                {cvUploading ? "Subiendo tu CV…" : "Subir mi CV (PDF, máx. 5 MB)"}
              </p>
              <p className="text-sm text-gray-500">
                Se guarda en tu perfil y lo ven las empresas donde te postulás.
              </p>
            </button>
            <button
              className="card w-full p-5 text-left hover:border-primary border-2 border-transparent"
              onClick={() => setStep("perfil")}
            >
              <p className="text-2xl mb-1">✍️</p>
              <p className="font-semibold text-primary-dark">No tengo CV</p>
              <p className="text-sm text-gray-500">
                Después podés generar uno profesional gratis con tus datos.
              </p>
            </button>
            {error && <ErrorNote error={error} />}
          </div>
        )}

        {step === "perfil" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-primary-dark">
                Mostrate como sos 📸
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {cvUploaded && "✅ Tu CV quedó guardado. "}
                Una foto y unas líneas sobre vos hacen que las empresas te
                elijan más. (Podés saltearlo y completarlo después.)
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="relative w-20 h-20 rounded-full bg-blue-50 text-primary flex items-center justify-center text-3xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary shrink-0"
                onClick={() => avatarInput.current?.click()}
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "📷"
                )}
              </button>
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatar(e.target.files?.[0])}
              />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Foto de perfil
                </p>
                <p className="text-xs text-gray-500">
                  Cámara o galería. Se ve en tu perfil y en tus postulaciones.
                </p>
              </div>
            </div>

            <div>
              <label className="label">Sobre mí (bio)</label>
              <textarea
                className="input min-h-20"
                maxLength={280}
                placeholder="Ej: Cajera con 2 años de experiencia. Responsable, puntual y con ganas de crecer."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-0.5">{bio.length}/280</p>
            </div>

            <button
              className="btn-primary w-full text-base"
              onClick={() => setStep("preferencias")}
            >
              Continuar
            </button>
          </div>
        )}

        {step === "preferencias" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-primary-dark">
                ¿En qué rubros querés trabajar?
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Elegí uno o más: el feed y las alertas se arman con esto.
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

        {step === "listo" && (
          <div className="text-center py-12 space-y-3 animate-pop">
            <p className="text-5xl">🎉</p>
            <h1 className="text-xl font-bold text-primary-dark">
              ¡Tu perfil está listo!
            </h1>
            <p className="text-sm text-gray-500">
              Ya podés postularte con 1 clic. Te avisamos cuando una empresa
              vea tu perfil.
            </p>
            {!cvUploaded && (
              <div className="card p-4 text-left bg-blue-50 border-blue-100 mt-4">
                <p className="text-sm font-semibold text-primary-dark">
                  ✨ ¿Sin CV? Te lo hacemos gratis
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Con los datos de tu perfil generamos un CV profesional en PDF.
                </p>
                <button
                  className="btn-primary w-full mt-3"
                  onClick={() => router.push("/cv")}
                >
                  📄 Generar mi CV gratis
                </button>
              </div>
            )}
            <button
              className={`${cvUploaded ? "btn-primary" : "btn-secondary"} w-full text-base`}
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
