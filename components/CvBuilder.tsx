"use client";

import { useState } from "react";
import Link from "next/link";
import type { Candidate } from "@/lib/types";

// Generador de CV de Worka: arma un CV profesional con los datos del perfil
// y lo descarga como PDF usando el diálogo de impresión del navegador.

interface Experience {
  role: string;
  place: string;
  period: string;
}

export default function CvBuilder({ candidate }: { candidate: Candidate }) {
  const [about, setAbout] = useState(
    candidate.first_job_mode
      ? "Estoy buscando mi primera oportunidad laboral. Aprendo rápido, soy responsable y tengo muchas ganas de crecer."
      : ""
  );
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [expDraft, setExpDraft] = useState<Experience>({
    role: "",
    place: "",
    period: "",
  });
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");

  function addExperience() {
    if (!expDraft.role || !expDraft.place) return;
    setExperiences((prev) => [...prev, expDraft]);
    setExpDraft({ role: "", place: "", period: "" });
  }

  function addSkill() {
    const s = skillDraft.trim();
    if (!s || skills.includes(s)) return;
    setSkills((prev) => [...prev, s]);
    setSkillDraft("");
  }

  return (
    <div className="space-y-4">
      {/* Controles (no se imprimen) */}
      <div className="print:hidden space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <Link href="/perfil" className="text-sm text-primary font-medium">
              ← Volver a mi perfil
            </Link>
            <h1 className="text-lg lg:text-2xl font-bold text-primary-dark mt-1">
              📄 Mi CV, gratis
            </h1>
            <p className="text-sm text-gray-500">
              Completá lo que quieras y descargalo. Los datos de tu perfil ya
              están cargados.
            </p>
          </div>
          <button className="btn-primary" onClick={() => window.print()}>
            ⬇️ Descargar PDF
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card p-4 space-y-2">
            <h2 className="font-semibold text-primary-dark text-sm">
              Sobre mí
            </h2>
            <textarea
              className="input min-h-24 text-sm"
              placeholder="Dos o tres líneas sobre vos…"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>

          <div className="card p-4 space-y-2">
            <h2 className="font-semibold text-primary-dark text-sm">
              Experiencia (opcional)
            </h2>
            {experiences.map((exp, i) => (
              <div
                key={`${exp.role}-${i}`}
                className="flex items-center justify-between bg-surface rounded-lg px-3 py-2 text-xs"
              >
                <span className="text-gray-700">
                  {exp.role} · {exp.place}
                </span>
                <button
                  className="text-gray-400 hover:text-danger"
                  onClick={() =>
                    setExperiences((prev) => prev.filter((_, j) => j !== i))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            <input
              className="input text-sm"
              placeholder="Puesto (ej: Vendedora)"
              value={expDraft.role}
              onChange={(e) =>
                setExpDraft((d) => ({ ...d, role: e.target.value }))
              }
            />
            <input
              className="input text-sm"
              placeholder="Lugar (ej: Tienda San José)"
              value={expDraft.place}
              onChange={(e) =>
                setExpDraft((d) => ({ ...d, place: e.target.value }))
              }
            />
            <input
              className="input text-sm"
              placeholder="Período (ej: 2024 - 2025)"
              value={expDraft.period}
              onChange={(e) =>
                setExpDraft((d) => ({ ...d, period: e.target.value }))
              }
            />
            <button className="btn-secondary w-full text-xs" onClick={addExperience}>
              + Agregar experiencia
            </button>
          </div>

          <div className="card p-4 space-y-3">
            <div>
              <h2 className="font-semibold text-primary-dark text-sm mb-1.5">
                Estudios
              </h2>
              <input
                className="input text-sm"
                placeholder="Ej: Secundaria completa — Colegio Nacional"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
            </div>
            <div>
              <h2 className="font-semibold text-primary-dark text-sm mb-1.5">
                Habilidades
              </h2>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {skills.map((s) => (
                  <span key={s} className="chip bg-surface text-gray-700">
                    {s}
                    <button
                      className="ml-1 text-gray-400"
                      onClick={() =>
                        setSkills((prev) => prev.filter((x) => x !== s))
                      }
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="input text-sm flex-1"
                  placeholder="Ej: Atención al cliente"
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button className="btn-secondary text-xs shrink-0" onClick={addSkill}>
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Vista previa 👇 — así queda tu CV. Al descargar, elegí
          &ldquo;Guardar como PDF&rdquo;.
        </p>
      </div>

      {/* Hoja del CV (lo único que se imprime) */}
      <div
        id="cv-sheet"
        className="bg-white rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-0 print:rounded-none max-w-3xl mx-auto overflow-hidden"
      >
        <div className="bg-primary-dark text-white px-8 py-6">
          <h2 className="text-2xl font-bold">{candidate.full_name}</h2>
          <p className="text-blue-200 text-sm mt-1">
            {candidate.preferences_industry.join(" · ") || "Buscando mi próximo paso"}
          </p>
          <p className="text-blue-100 text-sm mt-2">
            📍 {candidate.location_city} &nbsp;·&nbsp; 💬{" "}
            {candidate.phone_whatsapp}
            {candidate.phone_verified && " (verificado)"}
          </p>
        </div>
        <div className="px-8 py-6 space-y-5">
          {about && (
            <section>
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5">
                Sobre mí
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{about}</p>
            </section>
          )}
          {experiences.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5">
                Experiencia
              </h3>
              <div className="space-y-2.5">
                {experiences.map((exp, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-gray-800">
                      {exp.role}{" "}
                      <span className="font-normal text-gray-500">
                        — {exp.place}
                      </span>
                    </p>
                    {exp.period && (
                      <p className="text-xs text-gray-400">{exp.period}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {education && (
            <section>
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5">
                Estudios
              </h3>
              <p className="text-sm text-gray-700">{education}</p>
            </section>
          )}
          {skills.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5">
                Habilidades
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs border border-gray-200 rounded-full px-2.5 py-1 text-gray-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}
          <p className="text-[10px] text-gray-300 pt-2 border-t border-gray-100">
            CV generado gratis con Worka · worka.com.py · Tu próximo paso.
          </p>
        </div>
      </div>
    </div>
  );
}
