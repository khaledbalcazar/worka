/* eslint-disable @next/next/no-img-element -- la foto viene del perfil y tiene que salir en el PDF tal cual */
import type { CSSProperties, ReactNode } from "react";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { bullets, formatPeriod, type CvData, type CvTemplateId } from "@/lib/cv";

// Las tres plantillas del generador. Cada una es una hoja A4 (794 × 1122 px a
// 96 ppp; 1123 ya pasa de 297 mm y deja una hoja en blanco al imprimir) con tamaños en px fijos: la vista previa la escala y la impresión
// la usa tal cual, así que lo que se ve es lo que sale en el PDF.

export const SHEET_WIDTH = 794;
export const SHEET_HEIGHT = 1122;

const filled = <T extends Record<string, unknown>>(items: T[], key: keyof T) =>
  items.filter((i) => String(i[key] ?? "").trim());

function sectionsOf(cv: CvData) {
  return {
    experience: filled(cv.experience, "role"),
    education: filled(cv.education, "title"),
    tools: filled(cv.tools, "name"),
    languages: filled(cv.languages, "name"),
    certifications: filled(cv.certifications, "name"),
    courses: filled(cv.courses, "name"),
  };
}

export default function CvSheet({ cv, photoUrl }: { cv: CvData; photoUrl: string | null }) {
  const photo = cv.showPhoto && photoUrl ? photoUrl : null;
  const render = TEMPLATES[cv.template] ?? Modern;
  return (
    <div className="cv-sheet" style={{ width: SHEET_WIDTH, minHeight: SHEET_HEIGHT }}>
      {render({ cv, photo })}
    </div>
  );
}

const TEMPLATES: Record<CvTemplateId, (p: { cv: CvData; photo: string | null }) => ReactNode> = {
  clasico: (p) => <Classic {...p} />,
  moderno: (p) => <Modern {...p} />,
  ejecutivo: (p) => <Executive {...p} />,
};

function Lines({ text, style }: { text: string; style?: CSSProperties }) {
  return (
    <>
      {text
        .split("\n")
        .filter((l) => l.trim())
        .map((line, i) => (
          <p key={i} style={style}>{line}</p>
        ))}
    </>
  );
}

function Bullets({ text, marker = "disc", style }: { text: string; marker?: string; style?: CSSProperties }) {
  const items = bullets(text);
  if (!items.length) return null;
  return (
    <ul style={{ listStyle: marker, paddingLeft: 18, marginTop: 4, ...style }}>
      {items.map((b, i) => (
        <li key={i} style={{ marginTop: 2 }}>{b}</li>
      ))}
    </ul>
  );
}

function LevelBar({ level, color, track = "#d1d5db", dot = false }: { level: number; color: string; track?: string; dot?: boolean }) {
  const pct = `${(level / 5) * 100}%`;
  return (
    <div style={{ position: "relative", height: dot ? 3 : 8, background: track, borderRadius: 4, marginTop: 5 }}>
      <div style={{ width: pct, height: "100%", background: color, borderRadius: 4 }} />
      {dot && (
        <span
          style={{ position: "absolute", left: pct, top: "50%", width: 9, height: 9, marginLeft: -5, marginTop: -4.5, background: color, transform: "rotate(45deg)" }}
        />
      )}
    </div>
  );
}

/* ── 1. Clásico (ATS) ─────────────────────────────────────────────────── */

function ClassicH({ accent, children }: { accent: string; children: ReactNode }) {
  return (
    <h3 style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: accent, borderBottom: `1px solid ${accent}`, paddingBottom: 3, margin: "18px 0 8px" }}>
      {children}
    </h3>
  );
}

function ModernH({ side = false, children }: { side?: boolean; children: ReactNode }) {
  return (
    <h3 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#1f2937", margin: "22px 0 10px" }}>
      <span style={{ whiteSpace: "nowrap" }}>{children}</span>
      <span style={{ flex: 1, height: 1.5, background: "#1f2937", maxWidth: side ? 60 : undefined }} />
    </h3>
  );
}

function ExecSideH({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ fontSize: 15, fontWeight: 800, textTransform: "uppercase", color: "#1f2937", borderBottom: "2px solid #1f2937", paddingBottom: 3, margin: "22px 0 8px" }}>
      {children}
    </h3>
  );
}

function ExecH({ color, children }: { color: string; children: ReactNode }) {
  return (
    <h3 style={{ fontSize: 15, fontWeight: 800, textTransform: "uppercase", color, borderBottom: `2px solid ${color}`, paddingBottom: 3, margin: "20px 0 8px" }}>
      {children}
    </h3>
  );
}

function Classic({ cv }: { cv: CvData; photo: string | null }) {
  const s = sectionsOf(cv);
  const accent = cv.accent;
  const contact = [cv.email, cv.phone, cv.city, cv.website].filter((v) => v.trim());
  return (
    <div style={{ padding: "48px 56px", fontFamily: "Georgia, 'Times New Roman', serif", color: "#111827", fontSize: 12.5, lineHeight: 1.45 }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: accent, lineHeight: 1.1 }}>{cv.name}</h1>
      {cv.headline && <p style={{ fontSize: 14, marginTop: 4, fontStyle: "italic" }}>{cv.headline}</p>}
      {contact.length > 0 && <p style={{ marginTop: 8, fontSize: 12.5 }}>{contact.join("  •  ")}</p>}

      {cv.summary.trim() && (
        <>
          <ClassicH accent={accent}>Perfil profesional</ClassicH>
          <Lines text={cv.summary} style={{ textAlign: "justify" }} />
        </>
      )}

      {s.experience.length > 0 && (
        <>
          <ClassicH accent={accent}>Experiencia laboral</ClassicH>
          {s.experience.map((e, i) => (
            <div key={i} style={{ marginTop: i ? 12 : 0, breakInside: "avoid" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontWeight: 700 }}>
                <span>{e.company}</span>
                <span style={{ whiteSpace: "nowrap" }}>{formatPeriod(e.start, e.end, e.current)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontStyle: "italic" }}>
                <span>{e.role}</span>
                <span>{e.city}</span>
              </div>
              {e.description.trim() && <Lines text={e.description} style={{ marginTop: 3 }} />}
              <Bullets text={e.highlights} marker="square" />
            </div>
          ))}
        </>
      )}

      {s.education.length > 0 && (
        <>
          <ClassicH accent={accent}>Educación</ClassicH>
          {s.education.map((e, i) => (
            <div key={i} style={{ marginTop: i ? 10 : 0, breakInside: "avoid" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontWeight: 700 }}>
                <span>{e.institution}</span>
                <span style={{ whiteSpace: "nowrap" }}>{formatPeriod(e.start, e.end, e.current)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontStyle: "italic" }}>
                <span>{e.title}</span>
                <span>{e.city}</span>
              </div>
              <Bullets text={e.notes} marker="square" />
            </div>
          ))}
        </>
      )}

      {(cv.skills.length > 0 || s.tools.length > 0 || s.languages.length > 0) && (
        <>
          <ClassicH accent={accent}>Habilidades</ClassicH>
          {cv.skills.length > 0 && <p><strong>Competencias:</strong> {cv.skills.join("; ")}</p>}
          {s.tools.length > 0 && <p style={{ marginTop: 3 }}><strong>Herramientas:</strong> {s.tools.map((t) => t.name).join("; ")}</p>}
          {s.languages.length > 0 && (
            <p style={{ marginTop: 3 }}>
              <strong>Idiomas:</strong> {s.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join("; ")}
            </p>
          )}
        </>
      )}

      {(s.certifications.length > 0 || s.courses.length > 0) && (
        <>
          <ClassicH accent={accent}>Certificaciones y cursos</ClassicH>
          <ul style={{ listStyle: "square", paddingLeft: 18 }}>
            {[...s.certifications, ...s.courses].map((c, i) => (
              <li key={i} style={{ marginTop: 2 }}>
                <strong>{c.name}</strong>
                {c.issuer && ` — ${c.issuer}`}
                {c.year && ` (${c.year})`}
              </li>
            ))}
          </ul>
        </>
      )}

      {cv.extra.trim() && (
        <>
          <ClassicH accent={accent}>Información adicional</ClassicH>
          <Lines text={cv.extra} />
        </>
      )}
    </div>
  );
}

/* ── 2. Moderno con foto ──────────────────────────────────────────────── */

function Modern({ cv, photo }: { cv: CvData; photo: string | null }) {
  const s = sectionsOf(cv);
  const accent = cv.accent;
  const contact: [typeof MapPin, string][] = (
    [
      [MapPin, cv.city],
      [Phone, cv.phone],
      [Mail, cv.email],
      [Globe, cv.website],
    ] as [typeof MapPin, string][]
  ).filter(([, v]) => v.trim());
  return (
    <div style={{ padding: "40px 44px", fontFamily: "'Lato', 'Inter', Arial, sans-serif", color: "#1f2937", fontSize: 12, lineHeight: 1.5 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {photo && (
          <img src={photo} alt="" style={{ width: 128, height: 128, borderRadius: "50%", objectFit: "cover", border: "3px solid #1f2937", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, textAlign: photo ? "left" : "center", minWidth: 0 }}>
          <h1 style={{ fontSize: 36, fontWeight: 400, letterSpacing: 4, textTransform: "uppercase", lineHeight: 1.1 }}>{cv.name}</h1>
          {cv.headline && (
            <p style={{ fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 8, paddingBottom: 10, borderBottom: "2px solid #1f2937" }}>
              {cv.headline}
            </p>
          )}
        </div>
      </header>
      {contact.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 26px", marginTop: 16, paddingBottom: 14, borderBottom: "1px solid #e5e7eb" }}>
          {contact.map(([Icon, value]) => (
            <span key={value} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon size={14} color="#1f2937" /> {value}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "34% 1fr", gap: 30 }}>
        <aside>
          {s.education.length > 0 && (
            <>
              <ModernH side>Formación</ModernH>
              {s.education.map((e, i) => (
                <div key={i} style={{ marginTop: i ? 12 : 0, breakInside: "avoid" }}>
                  <p style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 11.5 }}>{e.title}</p>
                  <p>{e.institution}</p>
                  <p>{formatPeriod(e.start, e.end, e.current)}</p>
                </div>
              ))}
            </>
          )}
          {cv.skills.length > 0 && (
            <>
              <ModernH side>Soft skills</ModernH>
              {cv.skills.map((skill) => (
                <p key={skill} style={{ textTransform: "uppercase", fontSize: 11.5, marginTop: 5 }}>{skill}</p>
              ))}
            </>
          )}
          {s.tools.length > 0 && (
            <>
              <ModernH side>Habilidades</ModernH>
              {s.tools.map((t, i) => (
                <div key={i} style={{ marginTop: i ? 12 : 0 }}>
                  <p>{t.name}</p>
                  <LevelBar level={t.level} color={accent} track="#9ca3af" dot />
                </div>
              ))}
            </>
          )}
          {s.languages.length > 0 && (
            <>
              <ModernH side>Idiomas</ModernH>
              {s.languages.map((l, i) => (
                <p key={i} style={{ marginTop: 4 }}>
                  <strong>{l.name}</strong>
                  {l.level && ` — ${l.level}`}
                </p>
              ))}
            </>
          )}
        </aside>

        <main>
          {cv.summary.trim() && (
            <>
              <ModernH>Resumen</ModernH>
              <Lines text={cv.summary} style={{ textAlign: "justify" }} />
            </>
          )}
          {s.experience.length > 0 && (
            <>
              <ModernH>Experiencia</ModernH>
              {s.experience.map((e, i) => (
                <div key={i} style={{ marginTop: i ? 14 : 0, breakInside: "avoid" }}>
                  <p style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 11.5 }}>{e.role}</p>
                  <p>
                    {[e.company, e.city].filter(Boolean).join(", ")}
                    {(e.start || e.end || e.current) && ` | ${formatPeriod(e.start, e.end, e.current)}`}
                  </p>
                  {e.description.trim() && <Lines text={e.description} style={{ marginTop: 4, textAlign: "justify" }} />}
                  <Bullets text={e.highlights} />
                </div>
              ))}
            </>
          )}
          {(s.certifications.length > 0 || s.courses.length > 0) && (
            <>
              <ModernH>Certificados</ModernH>
              <ul style={{ listStyle: "disc", paddingLeft: 18 }}>
                {[...s.certifications, ...s.courses].map((c, i) => (
                  <li key={i} style={{ marginTop: 3 }}>
                    {c.name}
                    {c.issuer && ` - ${c.issuer}`}
                    {c.year && ` (${c.year})`}
                  </li>
                ))}
              </ul>
            </>
          )}
          {cv.extra.trim() && (
            <>
              <ModernH>Más sobre mí</ModernH>
              <Lines text={cv.extra} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── 3. Ejecutivo con barra lateral ───────────────────────────────────── */

function Executive({ cv, photo }: { cv: CvData; photo: string | null }) {
  const s = sectionsOf(cv);
  const navy = cv.accent;
  const contact: [typeof MapPin, string][] = (
    [
      [Globe, cv.website],
      [MapPin, cv.city],
      [Mail, cv.email],
      [Phone, cv.phone],
    ] as [typeof MapPin, string][]
  ).filter(([, v]) => v.trim());
  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", minHeight: SHEET_HEIGHT, fontFamily: "'Inter', Arial, sans-serif", color: "#1f2937", fontSize: 12, lineHeight: 1.5 }}>
      <aside style={{ background: "#efefef", paddingBottom: 32 }}>
        <div style={{ height: 210, background: photo ? "#f28c28" : navy, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
          {photo ? (
            <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ color: "#fff", fontSize: 64, fontWeight: 700, alignSelf: "center" }}>
              {cv.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
            </span>
          )}
        </div>
        <div style={{ padding: "18px 22px 0" }}>
          {contact.map(([Icon, value]) => (
            <p key={value} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, wordBreak: "break-word" }}>
              <Icon size={14} color={navy} style={{ flexShrink: 0 }} /> {value}
            </p>
          ))}
          {s.certifications.length > 0 && (
            <>
              <ExecSideH>Certificados</ExecSideH>
              {s.certifications.map((c, i) => (
                <div key={i} style={{ marginTop: i ? 8 : 0 }}>
                  <p>{c.name}{c.year && ` (${c.year})`}</p>
                  {c.issuer && <p style={{ fontWeight: 700, color: navy }}>{c.issuer}</p>}
                </div>
              ))}
            </>
          )}
          {s.languages.length > 0 && (
            <>
              <ExecSideH>Idiomas</ExecSideH>
              {s.languages.map((l, i) => (
                <p key={i} style={{ marginTop: 3 }}>{l.name}{l.level && ` – ${l.level}`}</p>
              ))}
            </>
          )}
          {(s.tools.length > 0 || cv.skills.length > 0) && (
            <>
              <ExecSideH>Habilidades</ExecSideH>
              {s.tools.map((t, i) => (
                <div key={i} style={{ marginTop: i ? 9 : 0 }}>
                  <p>{t.name}</p>
                  <LevelBar level={t.level} color={navy} track="#c7c7c7" />
                </div>
              ))}
              {cv.skills.length > 0 && (
                <p style={{ marginTop: s.tools.length ? 10 : 0 }}>{cv.skills.join(" · ")}</p>
              )}
            </>
          )}
          {cv.extra.trim() && (
            <>
              <ExecSideH>Más sobre mí</ExecSideH>
              <Lines text={cv.extra} />
            </>
          )}
        </div>
      </aside>

      <main style={{ padding: "26px 30px 32px" }}>
        <div style={{ background: navy, color: "#fff", padding: "20px 24px", margin: "0 0 4px -30px" }}>
          <h1 style={{ fontSize: 30, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", lineHeight: 1.15 }}>{cv.name}</h1>
          {cv.headline && <p style={{ fontSize: 15, marginTop: 6, opacity: 0.95 }}>{cv.headline}</p>}
        </div>
        {cv.summary.trim() && (
          <>
            <ExecH color={navy}>Perfil profesional</ExecH>
            <Lines text={cv.summary} style={{ textAlign: "justify" }} />
          </>
        )}
        {s.experience.length > 0 && (
          <>
            <ExecH color={navy}>Experiencia laboral</ExecH>
            {s.experience.map((e, i) => (
              <div key={i} style={{ marginTop: i ? 14 : 0, breakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <p>
                    {e.role}
                    {e.company && (
                      <strong style={{ color: navy }}>
                        {" "}- {[e.company, e.city].filter(Boolean).join(", ")}
                      </strong>
                    )}
                  </p>
                  <span style={{ fontSize: 10.5, whiteSpace: "nowrap" }}>{formatPeriod(e.start, e.end, e.current)}</span>
                </div>
                {e.description.trim() && <Lines text={e.description} style={{ marginTop: 4, textAlign: "justify" }} />}
                <Bullets text={e.highlights} />
              </div>
            ))}
          </>
        )}
        {s.education.length > 0 && (
          <>
            <ExecH color={navy}>Formación académica</ExecH>
            {s.education.map((e, i) => (
              <p key={i} style={{ marginTop: i ? 5 : 0 }}>
                {(e.end || e.current) && `${e.current ? "En curso" : e.end} - `}
                <strong>{e.title}</strong>
                {e.institution && ` - ${e.institution}`}
                {e.city && `, ${e.city}`}
              </p>
            ))}
          </>
        )}
        {s.courses.length > 0 && (
          <>
            <ExecH color={navy}>Cursos</ExecH>
            {s.courses.map((c, i) => (
              <p key={i} style={{ marginTop: i ? 5 : 0 }}>
                {c.name}
                {c.issuer && ` - ${c.issuer}`}
                {c.year && ` (${c.year})`}
              </p>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
