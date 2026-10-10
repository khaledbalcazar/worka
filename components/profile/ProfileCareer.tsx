"use client";

import { useState, useTransition } from "react";
import { Award, Briefcase, GraduationCap, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import MobileSheet from "@/components/MobileSheet";
import "./career.css";
import CourseBadges from "@/components/profile/CourseBadges";
import {
  EDUCATION_LEVEL_VALUES,
  MAX_SKILLS,
  educationPeriod,
  experiencePeriod,
  normalizeSkills,
  validateEducation,
  validateExperience,
} from "@/lib/career";
import type { CandidateEducation, CandidateExperience, CareerData, EducationLevel } from "@/lib/types";
import {
  deleteEducation,
  deleteExperience,
  saveEducation,
  saveExperience,
  updateSkills,
} from "@/app/actions";

const SKILL_SUGGESTIONS = [
  "Atención al cliente", "Manejo de caja", "Ventas", "Trabajo en equipo", "Excel",
  "Word", "Licencia de conducir", "Inglés básico", "Reposición", "Cocina",
  "Limpieza", "Redes sociales", "Facturación", "Inventario", "Guaraní",
];

type ExperienceDraft = { id?: string; role: string; company: string; start_month: string; end_month: string; current: boolean; description: string };
type EducationDraft = { id?: string; institution: string; title: string; level: EducationLevel; end_year: string; in_progress: boolean };

const emptyExperience: ExperienceDraft = { role: "", company: "", start_month: "", end_month: "", current: false, description: "" };
const emptyEducation: EducationDraft = { institution: "", title: "", level: "Secundario", end_year: "", in_progress: false };

function sortExperience(list: CandidateExperience[]) {
  return [...list].sort((a, b) => (b.end_date ?? "9999").localeCompare(a.end_date ?? "9999") || b.start_date.localeCompare(a.start_date));
}
function sortEducation(list: CandidateEducation[]) {
  return [...list].sort((a, b) => (b.end_year ?? 9999) - (a.end_year ?? 9999));
}

// Experiencia, estudios, habilidades y cursos de Academia en Mi perfil. Cada
// cambio se refleja solo cuando el servidor lo confirma.
export default function ProfileCareer({ initial }: { initial: CareerData }) {
  const [experience, setExperience] = useState(sortExperience(initial.experience));
  const [education, setEducation] = useState(sortEducation(initial.education));
  const [skills, setSkills] = useState(initial.skills);
  const [expDraft, setExpDraft] = useState<ExperienceDraft | null>(null);
  const [eduDraft, setEduDraft] = useState<EducationDraft | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [skillError, setSkillError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run<T extends { ok: boolean; error?: string }>(action: () => Promise<T>, onOk: (r: T) => void, setErr = setError) {
    setErr(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.ok) onOk(result);
        else setErr(result.error ?? "No pudimos guardar los cambios.");
      } catch {
        setErr("No pudimos conectar. Tus cambios siguen acá para reintentar.");
      }
    });
  }

  function submitExperience() {
    if (!expDraft) return;
    const input = {
      id: expDraft.id,
      role: expDraft.role,
      company: expDraft.company,
      start_month: expDraft.start_month,
      end_month: expDraft.current ? null : expDraft.end_month,
      description: expDraft.description,
    };
    const problem = validateExperience(input);
    if (problem) { setError(problem); return; }
    run(() => saveExperience(input), (r) => {
      const saved: CandidateExperience = {
        id: r.id ?? input.id ?? `local-${Date.now()}`,
        candidate_id: "",
        role: input.role.trim(),
        company: input.company.trim(),
        start_date: `${input.start_month}-01`,
        end_date: input.end_month ? `${input.end_month}-01` : null,
        description: input.description.trim(),
      };
      setExperience((list) => sortExperience([...list.filter((e) => e.id !== saved.id), saved]));
      setExpDraft(null);
    });
  }

  function submitEducation() {
    if (!eduDraft) return;
    const input = {
      id: eduDraft.id,
      institution: eduDraft.institution,
      title: eduDraft.title,
      level: eduDraft.level,
      end_year: eduDraft.in_progress || !eduDraft.end_year ? null : Number(eduDraft.end_year),
    };
    if (!eduDraft.in_progress && !eduDraft.end_year) { setError("Escribí el año de egreso o marcá que está en curso."); return; }
    const problem = validateEducation(input);
    if (problem) { setError(problem); return; }
    run(() => saveEducation(input), (r) => {
      const saved: CandidateEducation = {
        id: r.id ?? input.id ?? `local-${Date.now()}`,
        candidate_id: "",
        institution: input.institution.trim(),
        title: input.title.trim(),
        level: input.level,
        end_year: input.end_year,
      };
      setEducation((list) => sortEducation([...list.filter((e) => e.id !== saved.id), saved]));
      setEduDraft(null);
    });
  }

  function saveSkills(next: string[]) {
    const clean = normalizeSkills(next);
    run(() => updateSkills(clean), (r) => setSkills(r.skills ?? clean), setSkillError);
  }

  function addSkill(value: string) {
    if (!value.trim()) return;
    if (skills.length >= MAX_SKILLS) { setSkillError(`Podés cargar hasta ${MAX_SKILLS} habilidades.`); return; }
    saveSkills([...skills, value]);
    setSkillInput("");
  }

  const suggestions = SKILL_SUGGESTIONS.filter(
    (s) => !skills.some((k) => k.toLowerCase() === s.toLowerCase())
  ).slice(0, 6);

  return (
    <>
      <section id="experiencia" className="card profile-section">
        <div className="profile-section-title">
          <h2><Briefcase size={18} /> Experiencia laboral</h2>
          <button className="job-save" aria-label="Agregar experiencia" onClick={() => { setError(null); setExpDraft(emptyExperience); }}><Plus size={19} /></button>
        </div>
        {experience.length === 0 ? (
          <p className="profile-section-description">
            Sumá trabajos, changas o pasantías. Si buscás tu primer empleo, también cuentan el voluntariado o ayudar en un negocio familiar.
          </p>
        ) : (
          <ul className="career-list">
            {experience.map((e) => (
              <li key={e.id}>
                <span className="career-icon"><Briefcase size={17} /></span>
                <div className="min-w-0 flex-1">
                  <strong>{e.role}</strong>
                  <p>{e.company}</p>
                  <small>{experiencePeriod(e)}</small>
                  {e.description && <p className="career-description">{e.description}</p>}
                </div>
                <div className="career-actions">
                  <button aria-label={`Editar ${e.role}`} onClick={() => { setError(null); setExpDraft({ id: e.id, role: e.role, company: e.company, start_month: e.start_date.slice(0, 7), end_month: e.end_date?.slice(0, 7) ?? "", current: !e.end_date, description: e.description }); }}><Pencil size={15} /></button>
                  <button aria-label={`Eliminar ${e.role}`} disabled={pending} onClick={() => { if (window.confirm(`¿Eliminar "${e.role}" de tu perfil?`)) run(() => deleteExperience(e.id), () => setExperience((list) => list.filter((x) => x.id !== e.id))); }}><Trash2 size={15} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {experience.length === 0 && <button className="profile-text-action mt-1" onClick={() => { setError(null); setExpDraft(emptyExperience); }}><Plus size={14} /> Agregar experiencia</button>}
        {error && !expDraft && !eduDraft && <p role="alert" className="profile-error mt-3">{error}</p>}
      </section>

      <section id="estudios" className="card profile-section">
        <div className="profile-section-title">
          <h2><GraduationCap size={18} /> Estudios</h2>
          <button className="job-save" aria-label="Agregar estudios" onClick={() => { setError(null); setEduDraft(emptyEducation); }}><Plus size={19} /></button>
        </div>
        {education.length === 0 ? (
          <>
            <p className="profile-section-description">Colegio, carrera técnica, universidad o cursos que hayas hecho.</p>
            <button className="profile-text-action" onClick={() => { setError(null); setEduDraft(emptyEducation); }}><Plus size={14} /> Agregar estudios</button>
          </>
        ) : (
          <ul className="career-list">
            {education.map((e) => (
              <li key={e.id}>
                <span className="career-icon"><GraduationCap size={17} /></span>
                <div className="min-w-0 flex-1">
                  <strong>{e.title}</strong>
                  <p>{e.institution}</p>
                  <small>{e.level} · {educationPeriod(e)}</small>
                </div>
                <div className="career-actions">
                  <button aria-label={`Editar ${e.title}`} onClick={() => { setError(null); setEduDraft({ id: e.id, institution: e.institution, title: e.title, level: e.level, end_year: e.end_year ? String(e.end_year) : "", in_progress: e.end_year === null }); }}><Pencil size={15} /></button>
                  <button aria-label={`Eliminar ${e.title}`} disabled={pending} onClick={() => { if (window.confirm(`¿Eliminar "${e.title}" de tu perfil?`)) run(() => deleteEducation(e.id), () => setEducation((list) => list.filter((x) => x.id !== e.id))); }}><Trash2 size={15} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="habilidades" className="card profile-section">
        <div className="profile-section-title">
          <h2><Sparkles size={18} /> Habilidades</h2>
          <span className="text-xs text-gray-500">{skills.length}/{MAX_SKILLS}</span>
        </div>
        {skills.length > 0 ? (
          <ul className="skill-list" aria-label="Tus habilidades">
            {skills.map((s) => (
              <li key={s}>
                {s}
                <button aria-label={`Quitar ${s}`} disabled={pending} onClick={() => saveSkills(skills.filter((k) => k !== s))}><X size={13} /></button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="profile-section-description">Las empresas buscan por habilidades. Sumá lo que sabés hacer, aunque lo hayas aprendido fuera de un trabajo.</p>
        )}
        <form className="skill-form" onSubmit={(e) => { e.preventDefault(); addSkill(skillInput); }}>
          <label htmlFor="skill-input" className="sr-only">Nueva habilidad</label>
          <input id="skill-input" className="input" value={skillInput} maxLength={40} placeholder="Ej.: Manejo de caja" onChange={(e) => setSkillInput(e.target.value)} />
          <button className="btn-secondary" disabled={pending || !skillInput.trim()}>Agregar</button>
        </form>
        {suggestions.length > 0 && (
          <div className="skill-suggestions">
            <span>Sugerencias:</span>
            {suggestions.map((s) => <button key={s} disabled={pending} onClick={() => addSkill(s)}><Plus size={12} /> {s}</button>)}
          </div>
        )}
        {skillError && <p role="alert" className="text-sm text-danger mt-2">{skillError}</p>}
      </section>

      <section id="cursos" className="card profile-section">
        <div className="profile-section-title"><h2><Award size={18} /> Cursos de Academia Worka</h2></div>
        <CourseBadges courses={initial.courses} emptyHint />
      </section>

      <MobileSheet desktop open={!!expDraft} onClose={() => setExpDraft(null)} label={expDraft?.id ? "Editar experiencia" : "Agregar experiencia"} className="p-5">
        {expDraft && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submitExperience(); }}>
            <h2 className="text-lg font-semibold">{expDraft.id ? "Editar experiencia" : "Agregar experiencia"}</h2>
            <label className="block"><span className="label">Puesto</span><input className="input" required maxLength={80} value={expDraft.role} placeholder="Ej.: Cajera" onChange={(e) => setExpDraft({ ...expDraft, role: e.target.value })} /></label>
            <label className="block"><span className="label">Empresa o lugar</span><input className="input" required maxLength={80} value={expDraft.company} placeholder="Ej.: Supermercado del barrio" onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="label">Desde</span><input className="input" type="month" required value={expDraft.start_month} onChange={(e) => setExpDraft({ ...expDraft, start_month: e.target.value })} /></label>
              <label className="block"><span className="label">Hasta</span><input className="input" type="month" disabled={expDraft.current} required={!expDraft.current} value={expDraft.current ? "" : expDraft.end_month} onChange={(e) => setExpDraft({ ...expDraft, end_month: e.target.value })} /></label>
            </div>
            <label className="filter-check"><input type="checkbox" checked={expDraft.current} onChange={(e) => setExpDraft({ ...expDraft, current: e.target.checked })} /> Es mi trabajo actual</label>
            <label className="block"><span className="label">¿Qué hacías? <span className="text-gray-400 font-normal">(opcional)</span></span><textarea className="input min-h-24" maxLength={400} value={expDraft.description} placeholder="Tareas principales y logros concretos." onChange={(e) => setExpDraft({ ...expDraft, description: e.target.value })} /><span className="text-xs text-gray-500">{expDraft.description.length}/400</span></label>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2"><button type="button" className="btn-secondary flex-1" onClick={() => setExpDraft(null)}>Cancelar</button><button className="btn-primary flex-1" disabled={pending}>{pending ? "Guardando…" : "Guardar"}</button></div>
          </form>
        )}
      </MobileSheet>

      <MobileSheet desktop open={!!eduDraft} onClose={() => setEduDraft(null)} label={eduDraft?.id ? "Editar estudios" : "Agregar estudios"} className="p-5">
        {eduDraft && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submitEducation(); }}>
            <h2 className="text-lg font-semibold">{eduDraft.id ? "Editar estudios" : "Agregar estudios"}</h2>
            <label className="block"><span className="label">Título o curso</span><input className="input" required maxLength={100} value={eduDraft.title} placeholder="Ej.: Bachiller técnico en Contabilidad" onChange={(e) => setEduDraft({ ...eduDraft, title: e.target.value })} /></label>
            <label className="block"><span className="label">Institución</span><input className="input" required maxLength={100} value={eduDraft.institution} placeholder="Ej.: Colegio Nacional" onChange={(e) => setEduDraft({ ...eduDraft, institution: e.target.value })} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="label">Nivel</span><select className="input" value={eduDraft.level} onChange={(e) => setEduDraft({ ...eduDraft, level: e.target.value as EducationLevel })}>{EDUCATION_LEVEL_VALUES.map((l) => <option key={l}>{l}</option>)}</select></label>
              <label className="block"><span className="label">Año de egreso</span><input className="input" type="number" inputMode="numeric" min={1950} max={new Date().getFullYear() + 8} disabled={eduDraft.in_progress} value={eduDraft.in_progress ? "" : eduDraft.end_year} onChange={(e) => setEduDraft({ ...eduDraft, end_year: e.target.value })} /></label>
            </div>
            <label className="filter-check"><input type="checkbox" checked={eduDraft.in_progress} onChange={(e) => setEduDraft({ ...eduDraft, in_progress: e.target.checked })} /> Lo estoy cursando</label>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2"><button type="button" className="btn-secondary flex-1" onClick={() => setEduDraft(null)}>Cancelar</button><button className="btn-primary flex-1" disabled={pending}>{pending ? "Guardando…" : "Guardar"}</button></div>
          </form>
        )}
      </MobileSheet>
    </>
  );
}
