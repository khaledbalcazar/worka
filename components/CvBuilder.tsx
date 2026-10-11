"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Award,
  Briefcase,
  Check,
  ChevronDown,
  Download,
  Eye,
  GraduationCap,
  Languages,
  LayoutTemplate,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  User,
  Wrench,
  X,
} from "lucide-react";
import CvSheet, { SHEET_WIDTH } from "@/components/cv/CvTemplates";
import {
  CV_TEMPLATES,
  EMPTY_CERTIFICATION,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  LANGUAGE_LEVELS,
  cvChecklist,
  cvStorageKey,
  sanitizeCv,
  templateById,
  type CvData,
  type CvTemplateId,
} from "@/lib/cv";

// Generador de CV de Worka. Arranca con los datos del perfil, se completa
// por secciones con vista previa en vivo y se descarga como PDF con el
// diálogo de impresión del navegador (sin servidor ni librerías extra).
// El borrador se guarda solo en este navegador.

type SectionId = "plantilla" | "datos" | "perfil" | "experiencia" | "estudios" | "habilidades" | "idiomas" | "certificados" | "extra";

export default function CvBuilder({
  candidateId,
  initial,
  photoUrl,
}: {
  candidateId: string;
  initial: CvData;
  photoUrl: string | null;
}) {
  const [cv, setCv] = useState<CvData>(initial);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState<SectionId | null>("plantilla");
  const [mobileView, setMobileView] = useState<"editar" | "ver">("editar");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Recupera el borrador de este navegador (si hay) una vez montado.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(cvStorageKey(candidateId));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leer localStorage solo es posible después de montar
      if (raw) setCv(sanitizeCv(JSON.parse(raw), initial));
    } catch {
      // Sin almacenamiento o borrador roto: se arranca del perfil.
    }
    setLoaded(true);
  }, [candidateId, initial]);

  // Guardado automático, medio segundo después del último cambio.
  useEffect(() => {
    if (!loaded) return;
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(cvStorageKey(candidateId), JSON.stringify(cv));
        setSavedAt(Date.now());
      } catch {
        // Sin almacenamiento: el CV igual se puede descargar.
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [cv, loaded, candidateId]);

  function set<K extends keyof CvData>(key: K, value: CvData[K]) {
    setCv((c) => ({ ...c, [key]: value }));
  }

  function setTemplate(id: CvTemplateId) {
    setCv((c) => ({ ...c, template: id, accent: templateById(id).accents[0] }));
  }

  function resetFromProfile() {
    if (!window.confirm("¿Volver a cargar los datos de tu perfil? Se pierde lo que escribiste acá.")) return;
    setCv({ ...initial, template: cv.template, accent: cv.accent });
  }

  const checklist = cvChecklist(cv);
  const done = checklist.filter((c) => c.done).length;
  const template = templateById(cv.template);

  function showPreview() {
    setMobileView("ver");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const toggle = (id: SectionId) => setOpen((o) => (o === id ? null : id));

  return (
    <div className="cvb">
      {/* La hoja se imprime sola, a tamaño A4 y sin márgenes del navegador. */}
      <style>{`@media print { @page { size: A4; margin: 0; } }`}</style>

      <div className="cvb-top print:hidden">
        <div className="min-w-0">
          <Link href="/perfil" className="cvb-back"><ArrowLeft size={15} /> Mi perfil</Link>
          <h1 className="page-title mt-1">Mi CV</h1>
          <p className="text-sm text-muted">
            Elegí una plantilla, completá tus datos y descargalo en PDF. Es gratis.
            {savedAt && <span className="cvb-saved"><Check size={13} /> Guardado en este dispositivo</span>}
          </p>
        </div>
        <button type="button" className="btn-primary cvb-download" onClick={() => window.print()}>
          <Download size={16} /> Descargar PDF
        </button>
      </div>

      <div className="cvb-switch print:hidden" role="tablist" aria-label="Vista">
        <button role="tab" aria-selected={mobileView === "editar"} onClick={() => setMobileView("editar")}><Pencil size={15} /> Editar</button>
        <button role="tab" aria-selected={mobileView === "ver"} onClick={() => showPreview()}><Eye size={15} /> Vista previa</button>
      </div>

      <div className="cvb-layout">
        <div className={`cvb-editor print:hidden${mobileView === "ver" ? " is-hidden-mobile" : ""}`}>
          <div className="cvb-progress">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Tu CV está {done === checklist.length ? "completo" : `${done} de ${checklist.length}`}</span>
              <button type="button" className="cvb-link" onClick={resetFromProfile}><RotateCcw size={13} /> Cargar desde mi perfil</button>
            </div>
            <ul className="cvb-checks">
              {checklist.map((c) => (
                <li key={c.label} className={c.done ? "is-done" : ""}>
                  <span>{c.done ? <Check size={12} /> : null}</span>
                  {c.label}
                </li>
              ))}
            </ul>
          </div>

          <Section id="plantilla" title="Plantilla y color" icon={<LayoutTemplate size={17} />} open={open} onToggle={toggle} summary={template.name}>
            <div className="cvb-templates">
              {CV_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`cvb-template${cv.template === t.id ? " is-active" : ""}`}
                  aria-pressed={cv.template === t.id}
                  onClick={() => setTemplate(t.id)}
                >
                  <span className="cvb-thumb" aria-hidden="true">
                    <span className="cvb-thumb-inner">
                      <CvSheet cv={{ ...cv, template: t.id, accent: cv.template === t.id ? cv.accent : t.accents[0] }} photoUrl={photoUrl} />
                    </span>
                  </span>
                  <span className="cvb-template-name">{t.name}</span>
                  <span className="cvb-template-desc">{t.description}</span>
                </button>
              ))}
            </div>
            <p className="label mt-4">Color</p>
            <div className="flex gap-2">
              {template.accents.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`cvb-swatch${cv.accent === color ? " is-active" : ""}`}
                  style={{ background: color }}
                  aria-label={`Color ${color}`}
                  aria-pressed={cv.accent === color}
                  onClick={() => set("accent", color)}
                />
              ))}
            </div>
          </Section>

          <Section id="datos" title="Datos personales" icon={<User size={17} />} open={open} onToggle={toggle} summary={cv.name}>
            {cv.template !== "clasico" && (
              <label className="cvb-check">
                <input type="checkbox" checked={cv.showPhoto} disabled={!photoUrl} onChange={(e) => set("showPhoto", e.target.checked)} />
                <span>
                  Mostrar mi foto
                  {!photoUrl && <> · <Link href="/perfil" className="text-primary">subí una en tu perfil</Link></>}
                </span>
              </label>
            )}
            <div className="cvb-grid">
              <Field label="Nombre completo" value={cv.name} onChange={(v) => set("name", v)} max={80} />
              <Field label="Título o puesto" value={cv.headline} onChange={(v) => set("headline", v)} max={100} placeholder="Ej: Vendedora · Atención al cliente" />
              <Field label="Email" value={cv.email} onChange={(v) => set("email", v)} max={120} type="email" />
              <Field label="Teléfono / WhatsApp" value={cv.phone} onChange={(v) => set("phone", v)} max={40} type="tel" />
              <Field label="Ciudad" value={cv.city} onChange={(v) => set("city", v)} max={80} />
              <Field label="LinkedIn o web (opcional)" value={cv.website} onChange={(v) => set("website", v)} max={120} placeholder="linkedin.com/in/tu-nombre" />
            </div>
          </Section>

          <Section id="perfil" title="Perfil profesional" icon={<Sparkles size={17} />} open={open} onToggle={toggle} summary={cv.summary ? `${cv.summary.slice(0, 40)}…` : "Vacío"}>
            <Field
              label="Contá en 3 o 4 líneas quién sos y qué buscás"
              value={cv.summary}
              onChange={(v) => set("summary", v)}
              max={1200}
              area
              rows={5}
              placeholder="Ej: Tengo 3 años de experiencia en atención al cliente y ventas en tiendas de ropa. Me destaco por la buena atención y el cierre de caja sin diferencias. Busco crecer en el área comercial."
            />
            <p className="cvb-tip">Tip: mencioná años de experiencia, tu fuerte y qué tipo de trabajo buscás.</p>
          </Section>

          <Section id="experiencia" title="Experiencia laboral" icon={<Briefcase size={17} />} open={open} onToggle={toggle} summary={count(cv.experience.filter((e) => e.role).length, "puesto", "puestos")}>
            <Repeater
              items={cv.experience}
              onChange={(items) => set("experience", items)}
              empty={EMPTY_EXPERIENCE}
              max={15}
              addLabel="Agregar experiencia"
              itemTitle={(e) => e.role || "Nueva experiencia"}
              render={(e, update) => (
                <div className="cvb-grid">
                  <Field label="Puesto" value={e.role} onChange={(v) => update({ role: v })} max={100} placeholder="Ej: Cajera" />
                  <Field label="Empresa" value={e.company} onChange={(v) => update({ company: v })} max={100} placeholder="Ej: Supermercado Real" />
                  <Field label="Ciudad" value={e.city} onChange={(v) => update({ city: v })} max={80} />
                  <div className="cvb-dates">
                    <Field label="Desde" type="month" value={e.start} onChange={(v) => update({ start: v })} max={7} />
                    <Field label="Hasta" type="month" value={e.current ? "" : e.end} onChange={(v) => update({ end: v })} max={7} disabled={e.current} />
                  </div>
                  <label className="cvb-check cvb-wide">
                    <input type="checkbox" checked={e.current} onChange={(ev) => update({ current: ev.target.checked })} />
                    <span>Trabajo acá actualmente</span>
                  </label>
                  <Field label="Descripción (opcional)" value={e.description} onChange={(v) => update({ description: v })} max={800} area wide placeholder="De qué se ocupa la empresa o tu área." />
                  <Field label="Tareas y logros (uno por línea)" value={e.highlights} onChange={(v) => update({ highlights: v })} max={1200} area wide rows={4} placeholder={"Atención a más de 100 clientes por día\nCierre de caja sin diferencias durante 12 meses"} />
                </div>
              )}
            />
          </Section>

          <Section id="estudios" title="Estudios" icon={<GraduationCap size={17} />} open={open} onToggle={toggle} summary={count(cv.education.filter((e) => e.title).length, "estudio", "estudios")}>
            <Repeater
              items={cv.education}
              onChange={(items) => set("education", items)}
              empty={EMPTY_EDUCATION}
              max={10}
              addLabel="Agregar estudio"
              itemTitle={(e) => e.title || "Nuevo estudio"}
              render={(e, update) => (
                <div className="cvb-grid">
                  <Field label="Título" value={e.title} onChange={(v) => update({ title: v })} max={120} placeholder="Ej: Bachiller en Ciencias Sociales" />
                  <Field label="Institución" value={e.institution} onChange={(v) => update({ institution: v })} max={120} />
                  <Field label="Ciudad" value={e.city} onChange={(v) => update({ city: v })} max={80} />
                  <div className="cvb-dates">
                    <Field label="Inicio (año)" value={e.start} onChange={(v) => update({ start: v.replace(/\D/g, "") })} max={4} inputMode="numeric" />
                    <Field label="Fin (año)" value={e.current ? "" : e.end} onChange={(v) => update({ end: v.replace(/\D/g, "") })} max={4} inputMode="numeric" disabled={e.current} />
                  </div>
                  <label className="cvb-check cvb-wide">
                    <input type="checkbox" checked={e.current} onChange={(ev) => update({ current: ev.target.checked })} />
                    <span>Lo estoy cursando</span>
                  </label>
                  <Field label="Detalles (opcional, uno por línea)" value={e.notes} onChange={(v) => update({ notes: v })} max={400} area wide placeholder="Ej: Mejor promedio de la promoción" />
                </div>
              )}
            />
          </Section>

          <Section id="habilidades" title="Habilidades" icon={<Wrench size={17} />} open={open} onToggle={toggle} summary={count(cv.skills.length + cv.tools.filter((t) => t.name).length, "habilidad", "habilidades")}>
            <ChipInput label="Habilidades personales" values={cv.skills} onChange={(v) => set("skills", v)} max={20} placeholder="Ej: Trabajo en equipo" suggestions={["Atención al cliente", "Trabajo en equipo", "Puntualidad", "Comunicación", "Resolución de problemas", "Ventas"]} />
            <p className="label mt-4">Herramientas y conocimientos (con nivel)</p>
            <div className="space-y-2">
              {cv.tools.map((t, i) => (
                <div key={i} className="cvb-tool">
                  <input className="input" value={t.name} maxLength={50} placeholder="Ej: Excel" aria-label="Herramienta" onChange={(e) => set("tools", cv.tools.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <select className="input" value={t.level} aria-label="Nivel" onChange={(e) => set("tools", cv.tools.map((x, j) => (j === i ? { ...x, level: Number(e.target.value) } : x)))}>
                    <option value={1}>Básico</option>
                    <option value={2}>Inicial</option>
                    <option value={3}>Intermedio</option>
                    <option value={4}>Avanzado</option>
                    <option value={5}>Experto</option>
                  </select>
                  <button type="button" className="cvb-icon-btn" aria-label="Quitar" onClick={() => set("tools", cv.tools.filter((_, j) => j !== i))}><X size={15} /></button>
                </div>
              ))}
            </div>
            {cv.tools.length < 12 && (
              <button type="button" className="cvb-add" onClick={() => set("tools", [...cv.tools, { name: "", level: 3 }])}><Plus size={15} /> Agregar herramienta</button>
            )}
          </Section>

          <Section id="idiomas" title="Idiomas" icon={<Languages size={17} />} open={open} onToggle={toggle} summary={cv.languages.map((l) => l.name).filter(Boolean).join(", ") || "Vacío"}>
            <div className="space-y-2">
              {cv.languages.map((l, i) => (
                <div key={i} className="cvb-tool">
                  <input className="input" value={l.name} maxLength={40} placeholder="Ej: Guaraní" aria-label="Idioma" onChange={(e) => set("languages", cv.languages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <select className="input" value={l.level} aria-label="Nivel" onChange={(e) => set("languages", cv.languages.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)))}>
                    <option value="">Nivel</option>
                    {LANGUAGE_LEVELS.map((lv) => <option key={lv}>{lv}</option>)}
                  </select>
                  <button type="button" className="cvb-icon-btn" aria-label="Quitar" onClick={() => set("languages", cv.languages.filter((_, j) => j !== i))}><X size={15} /></button>
                </div>
              ))}
            </div>
            {cv.languages.length < 8 && (
              <button type="button" className="cvb-add" onClick={() => set("languages", [...cv.languages, { name: "", level: "" }])}><Plus size={15} /> Agregar idioma</button>
            )}
          </Section>

          <Section id="certificados" title="Certificados y cursos" icon={<Award size={17} />} open={open} onToggle={toggle} summary={count(cv.certifications.filter((c) => c.name).length + cv.courses.filter((c) => c.name).length, "elemento", "elementos")}>
            <p className="label">Certificados</p>
            <CertList items={cv.certifications} onChange={(v) => set("certifications", v)} addLabel="Agregar certificado" />
            <p className="label mt-4">Cursos</p>
            <CertList items={cv.courses} onChange={(v) => set("courses", v)} addLabel="Agregar curso" />
          </Section>

          <Section id="extra" title="Más sobre mí" icon={<Plus size={17} />} open={open} onToggle={toggle} summary={cv.extra ? "Completo" : "Opcional"}>
            <Field
              label="Disponibilidad, licencia de conducir, voluntariado, intereses…"
              value={cv.extra}
              onChange={(v) => set("extra", v)}
              max={600}
              area
              rows={3}
              placeholder={"Disponibilidad inmediata, turno mañana o tarde\nLicencia de conducir categoría B"}
            />
          </Section>

          <button type="button" className="btn-primary w-full mt-2 lg:hidden" onClick={() => showPreview()}>
            <Eye size={16} /> Ver cómo queda
          </button>
        </div>

        <div className={`cvb-preview-col${mobileView === "editar" ? " is-hidden-mobile" : ""}`}>
          <ScaledSheet cv={cv} photoUrl={photoUrl} />
          <p className="text-xs text-muted text-center mt-3 print:hidden">
            Al descargar elegí «Guardar como PDF». Si sale con encabezados del navegador, desactivá «Encabezados y pies de página».
          </p>
          <button type="button" className="btn-primary w-full mt-3 lg:hidden print:hidden" onClick={() => window.print()}>
            <Download size={16} /> Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function count(n: number, one: string, many: string) {
  return n ? `${n} ${n === 1 ? one : many}` : "Vacío";
}

// La hoja mide 794 px; acá se escala al ancho disponible. Al imprimir se
// quita la escala (ver .cvb-scaler en globals.css).
function ScaledSheet({ cv, photoUrl }: { cv: CvData; photoUrl: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const measure = () => {
      const next = Math.min(1, box.clientWidth / SHEET_WIDTH);
      setScale(next);
      const sheet = box.querySelector<HTMLElement>(".cv-sheet");
      if (sheet) setHeight(sheet.offsetHeight * next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    const sheet = box.querySelector<HTMLElement>(".cv-sheet");
    if (sheet) ro.observe(sheet);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="cvb-preview" style={{ height: height ?? undefined }}>
      <div className="cvb-scaler" style={{ transform: `scale(${scale})` }}>
        <CvSheet cv={cv} photoUrl={photoUrl} />
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  icon,
  summary,
  open,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  icon: ReactNode;
  summary?: string;
  open: SectionId | null;
  onToggle: (id: SectionId) => void;
  children: ReactNode;
}) {
  const isOpen = open === id;
  return (
    <section className={`cvb-section${isOpen ? " is-open" : ""}`}>
      <button type="button" className="cvb-section-head" aria-expanded={isOpen} aria-controls={`cvb-${id}`} onClick={() => onToggle(id)}>
        <span className="cvb-section-icon">{icon}</span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block font-semibold">{title}</span>
          {summary && !isOpen && <span className="block text-xs text-muted truncate">{summary}</span>}
        </span>
        <ChevronDown size={18} className="cvb-chevron" />
      </button>
      {isOpen && <div id={`cvb-${id}`} className="cvb-section-body">{children}</div>}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  max,
  area,
  wide,
  rows = 2,
  type = "text",
  placeholder,
  disabled,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  area?: boolean;
  wide?: boolean;
  rows?: number;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  inputMode?: "numeric";
}) {
  return (
    <label className={wide ? "cvb-wide" : undefined}>
      <span className="label">{label}</span>
      {area ? (
        <textarea className="input" rows={rows} value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input" type={type} value={value} maxLength={max} placeholder={placeholder} disabled={disabled} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function Repeater<T>({
  items,
  onChange,
  empty,
  max,
  addLabel,
  itemTitle,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  max: number;
  addLabel: string;
  itemTitle: (item: T) => string;
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const move = (i: number, d: -1 | 1) => {
    const to = i + d;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[i], next[to]] = [next[to], next[i]];
    onChange(next);
    setEditing((e) => (e === i ? to : e === to ? i : e));
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className={`cvb-item${editing === i ? " is-open" : ""}`}>
          <div className="cvb-item-head">
            <button type="button" className="min-w-0 flex-1 text-left font-medium truncate" onClick={() => setEditing((e) => (e === i ? null : i))}>
              {itemTitle(item)}
            </button>
            <button type="button" className="cvb-icon-btn" aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} /></button>
            <button type="button" className="cvb-icon-btn" aria-label="Bajar" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} /></button>
            <button type="button" className="cvb-icon-btn" aria-label={editing === i ? "Cerrar" : "Editar"} onClick={() => setEditing((e) => (e === i ? null : i))}>
              {editing === i ? <Check size={14} /> : <Pencil size={14} />}
            </button>
            <button
              type="button"
              className="cvb-icon-btn is-danger"
              aria-label="Eliminar"
              onClick={() => {
                onChange(items.filter((_, j) => j !== i));
                setEditing(null);
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
          {editing === i && (
            <div className="cvb-item-body">
              {render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
            </div>
          )}
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          className="cvb-add"
          onClick={() => {
            onChange([...items, { ...empty }]);
            setEditing(items.length);
          }}
        >
          <Plus size={15} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function ChipInput({
  label,
  values,
  onChange,
  max,
  placeholder,
  suggestions,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  max: number;
  placeholder: string;
  suggestions: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (value: string) => {
    const v = value.trim().slice(0, 50);
    if (!v || values.length >= max || values.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...values, v]);
    setDraft("");
  };
  const unused = suggestions.filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()));
  return (
    <div>
      <p className="label">{label}</p>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map((v) => (
            <span key={v} className="cvb-chip">
              {v}
              <button type="button" aria-label={`Quitar ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          value={draft}
          maxLength={50}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
          }}
        />
        <button type="button" className="btn-secondary !px-4" onClick={() => add(draft)} aria-label="Agregar"><Plus size={16} /></button>
      </div>
      {unused.length > 0 && values.length < max && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {unused.slice(0, 6).map((s) => (
            <button key={s} type="button" className="cvb-suggestion" onClick={() => add(s)}>+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function CertList({
  items,
  onChange,
  addLabel,
}: {
  items: CvData["certifications"];
  onChange: (items: CvData["certifications"]) => void;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((c, i) => (
        <div key={i} className="cvb-cert">
          <input className="input" value={c.name} maxLength={120} placeholder="Nombre" aria-label="Nombre" onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
          <input className="input" value={c.issuer} maxLength={100} placeholder="Institución" aria-label="Institución" onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, issuer: e.target.value } : x)))} />
          <input className="input" value={c.year} maxLength={4} inputMode="numeric" placeholder="Año" aria-label="Año" onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, year: e.target.value.replace(/\D/g, "") } : x)))} />
          <button type="button" className="cvb-icon-btn" aria-label="Quitar" onClick={() => onChange(items.filter((_, j) => j !== i))}><X size={15} /></button>
        </div>
      ))}
      {items.length < 12 && (
        <button type="button" className="cvb-add" onClick={() => onChange([...items, { ...EMPTY_CERTIFICATION }])}><Plus size={15} /> {addLabel}</button>
      )}
    </div>
  );
}
