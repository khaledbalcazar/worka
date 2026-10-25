import path from "node:path";
import { Document, Font, Page, Polygon, Line, Circle, StyleSheet, Svg, Text, View, G } from "@react-pdf/renderer";
import type { InformeModelo, RasgoModelo } from "./modelo";

// Plantilla del informe PDF. Solo dibuja lo que trae el modelo: las reglas
// (qué se muestra, cuándo y con qué texto) viven en modelo.ts.
//
// A4 vertical, márgenes de 19 mm, cuerpo de 10.5 pt. Fondo blanco y poca
// tinta: todo lo que importa se lee también impreso en blanco y negro, y
// ningún estado se comunica solo con color.

const FUENTES = path.join(process.cwd(), "lib", "evaluar", "pdf", "fonts");
let registradas = false;
function registrarFuentes() {
  if (registradas) return;
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(FUENTES, "inter-latin-400-normal.woff"), fontWeight: 400 },
      { src: path.join(FUENTES, "inter-latin-400-italic.woff"), fontWeight: 400, fontStyle: "italic" },
      { src: path.join(FUENTES, "inter-latin-600-normal.woff"), fontWeight: 600 },
      { src: path.join(FUENTES, "inter-latin-700-normal.woff"), fontWeight: 700 },
    ],
  });
  // Sin guiones de corte inventados en palabras en español.
  Font.registerHyphenationCallback((w) => [w]);
  registradas = true;
}

const MM = 2.835;
const TINTA = "#1d2226";
const TEXTO = "#3a3f47";
const SUAVE = "#5f6570";
const LINEA = "#d9d7d3";
const AZUL = "#0a66c2";
const VIOLETA = "#5d5294";

const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10.5,
    lineHeight: 1.4,
    color: TEXTO,
    paddingTop: 30 * MM,
    paddingBottom: 22 * MM,
    paddingHorizontal: 19 * MM,
    backgroundColor: "#ffffff",
  },
  header: {
    position: "absolute",
    top: 11 * MM,
    left: 19 * MM,
    right: 19 * MM,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 6,
    borderBottomWidth: 0.75,
    borderBottomColor: LINEA,
    fontSize: 8.5,
    color: SUAVE,
  },
  marca: { fontSize: 10, fontWeight: 700, color: "#004e99" },
  marcaChip: { fontSize: 8.5, fontWeight: 600, color: VIOLETA },
  // Se ubica desde arriba: con `bottom` react-pdf lo dejaba fuera de la hoja.
  footer: {
    position: "absolute",
    top: 297 * MM - 18 * MM,
    left: 19 * MM,
    right: 19 * MM,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 0.75,
    borderTopColor: LINEA,
    fontSize: 8.5,
    color: SUAVE,
  },
  eyebrow: { fontSize: 9, fontWeight: 600, color: VIOLETA, letterSpacing: 0.6, textTransform: "uppercase" },
  nombre: { fontSize: 22, fontWeight: 700, color: TINTA, marginTop: 3, lineHeight: 1.15 },
  proceso: { fontSize: 11.5, color: TEXTO, marginTop: 4 },
  meta: { fontSize: 9.5, color: SUAVE, marginTop: 2 },
  h2: { fontSize: 13, fontWeight: 700, color: TINTA, marginBottom: 6 },
  seccion: { marginTop: 16 },
  p: { fontSize: 10.5, color: TEXTO },
  nota: { fontSize: 9, color: SUAVE },
  indicadores: { flexDirection: "row", marginTop: 6 },
  indicador: { flex: 1, borderWidth: 0.75, borderColor: LINEA, borderRadius: 6, padding: 9 },
  indEtiqueta: { fontSize: 8.5, fontWeight: 600, color: SUAVE, textTransform: "uppercase", letterSpacing: 0.4 },
  indValor: { fontSize: 20, fontWeight: 700, color: TINTA, marginTop: 4, lineHeight: 1.2, marginBottom: 2 },
  indSinValor: { fontSize: 13, fontWeight: 600, color: SUAVE, marginTop: 6, lineHeight: 1.2, marginBottom: 2 },
  indDetalle: { fontSize: 9, color: TEXTO, marginTop: 4, lineHeight: 1.35 },
  caja: { borderWidth: 0.75, borderColor: LINEA, borderRadius: 6, padding: 9, marginTop: 6 },
  cajaAlerta: { borderWidth: 1.25, borderColor: "#b45309", borderRadius: 6, padding: 9, marginTop: 6 },
  etiquetaNivel: { fontSize: 8, fontWeight: 700, color: "#7c3e06", textTransform: "uppercase", letterSpacing: 0.5 },
  bold: { fontWeight: 600, color: TINTA },
  fila: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINEA, paddingVertical: 5 },
  thFila: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: TINTA, paddingBottom: 4, marginTop: 8 },
  th: { fontSize: 8.5, fontWeight: 700, color: TINTA, textTransform: "uppercase", letterSpacing: 0.4 },
  pista: { height: 5, borderRadius: 3, backgroundColor: "#ebe9e6", marginTop: 3, borderWidth: 0.5, borderColor: "#cfccc7" },
  barra: { height: 5, borderRadius: 3 },
  vineta: { flexDirection: "row", marginTop: 3 },
});

export default function InformePdf({ m }: { m: InformeModelo }) {
  registrarFuentes();
  return (
    <Document
      title="Informe de evaluación — Worka Evaluar"
      author="Worka Evaluar"
      subject="Informe de evaluación de candidato"
      creator={`Worka Evaluar (${m.version})`}
      producer="Worka Evaluar"
      language="es-PY"
    >
      <Page size="A4" style={s.page}>
        {/* Encabezado y pie en cada hoja, con lo mínimo para identificarla. */}
        <View style={s.header} fixed>
          <Text>
            <Text style={s.marca}>Worka</Text>
            <Text style={{ color: AZUL, fontSize: 10 }}>.click</Text>
            <Text style={s.marcaChip}>  Evaluar</Text>
          </Text>
          <Text>Informe de evaluación · {m.nombre}</Text>
        </View>
        <View style={s.footer} fixed>
          <Text>Generado el {m.generado} · Uso interno del proceso de selección</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>

        {/* ── Identificación ── */}
        <View wrap={false}>
          <Text style={s.eyebrow}>Informe de evaluación</Text>
          <Text style={s.nombre}>{m.nombre}</Text>
          <Text style={s.proceso}>
            {m.proceso}
            {m.area ? ` · ${m.area}` : ""}
          </Text>
          <Text style={s.meta}>Worka Evaluar · Informe del {m.fechaInforme}</Text>
          <Text style={s.meta}>
            Estado: {m.estado}   |   Origen: {m.origen}
          </Text>
          {m.ubicacionContacto.length > 0 && <Text style={s.meta}>{m.ubicacionContacto.join("   |   ")}</Text>}
          {m.responsable && <Text style={s.meta}>Responsable: {m.responsable}</Text>}
        </View>

        {/* ── Resumen ── */}
        <View style={s.seccion} wrap={false}>
          <Text style={s.h2}>Resumen de resultados</Text>
          <View style={s.indicadores}>
            {m.resumen.map((ind, i) => (
              <View key={ind.etiqueta} style={[s.indicador, i > 0 ? { marginLeft: 8 } : {}]}>
                <Text style={s.indEtiqueta}>{ind.etiqueta}</Text>
                {ind.valor !== null ? <Text style={s.indValor}>{ind.valor}</Text> : <Text style={s.indSinValor}>{ind.sinValor}</Text>}
                <Text style={s.indDetalle}>{ind.detalle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Calidad de la respuesta ── */}
        {(m.calidad.length > 0 || m.consistencia) && (
          <View style={s.seccion} wrap={false}>
            <Text style={s.h2}>Calidad de la respuesta</Text>
            {m.calidad.length > 0 ? (
              <>
                {m.calidad.map((q) => (
                  <View key={q.titulo} style={q.nivel === "Alerta" ? s.cajaAlerta : s.caja}>
                    <Text style={s.etiquetaNivel}>{q.nivel}</Text>
                    <Text style={[s.p, s.bold, { marginTop: 2 }]}>{q.titulo}</Text>
                    <Text style={[s.p, { marginTop: 2 }]}>{q.detalle}</Text>
                  </View>
                ))}
                <Text style={[s.nota, { marginTop: 6 }]}>
                  Estas señales advierten que el perfil puede no ser confiable. Se leen junto a los resultados y no equivalen por sí solas a
                  fraude, a invalidar toda la evaluación ni a una decisión de descarte.
                </Text>
              </>
            ) : (
              <View style={s.caja}>
                <Text style={[s.p, s.bold]}>Respuesta consistente</Text>
                <Text style={[s.p, { marginTop: 2 }]}>{m.consistencia}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Integridad ── */}
        {m.integridad && (
          <View style={s.seccion}>
            <View wrap={false}>
              <Text style={s.h2}>Integridad laboral</Text>
              <Text style={s.p}>
                Actitudes ante situaciones de trabajo. No mide conducta pasada ni indaga sobre la vida privada del candidato.
              </Text>
              {m.integridad.validez.length > 0 && (
                <View style={m.integridad.confiable ? s.caja : s.cajaAlerta}>
                  <Text style={[s.p, s.bold]}>
                    {m.integridad.confiable ? "Sin señales de respuesta complaciente" : "Patrón de respuesta muy favorable"}
                  </Text>
                  <Text style={[s.p, { marginTop: 2 }]}>
                    {m.integridad.confiable
                      ? "Admitió faltas menores que casi todo el mundo tiene. Es una señal, no una prueba de sinceridad."
                      : "Se mostró impecable incluso en cosas que casi nadie cumple. No es una acusación: tomá los factores con cautela y repreguntá en la entrevista."}
                  </Text>
                </View>
              )}
              <View style={s.thFila}>
                <Text style={[s.th, { flex: 2.2 }]}>Factor</Text>
                <Text style={[s.th, { flex: 1.3 }]}>Resultado</Text>
                <Text style={[s.th, { flex: 3 }]}>Lectura</Text>
              </View>
            </View>
            {[...m.integridad.validez, ...m.integridad.riesgo].map((f) => (
              <View key={f.key} style={s.fila} wrap={false}>
                <View style={{ flex: 2.2, paddingRight: 8 }}>
                  <Text style={[s.p, s.bold]}>{f.label}</Text>
                  {f.validez && <Text style={s.nota}>Escala de validez</Text>}
                </View>
                <View style={{ flex: 1.3, paddingRight: 8 }}>
                  <Text style={s.p}>{f.pct}%</Text>
                  <Barra pct={f.pct} color="#6b7280" />
                  <Text style={[s.nota, { marginTop: 2 }]}>{f.bandaTexto}</Text>
                </View>
                <Text style={[s.p, { flex: 3 }]}>{f.lectura}</Text>
              </View>
            ))}
            <View style={s.caja} wrap={false}>
              <Text style={[s.p, s.bold]}>Cómo usar este resultado</Text>
              <Text style={[s.p, { marginTop: 2 }]}>
                {m.integridad.paraHablar.length > 0
                  ? `Conviene repreguntar en la entrevista sobre: ${m.integridad.paraHablar.map((x) => x.toLowerCase()).join(", ")}. Planteá una situación concreta del puesto y escuchá cómo la resolvería.`
                  : "No hay factores que pidan atención especial. Eso no certifica nada sobre la persona."}
              </Text>
              <Text style={[s.nota, { marginTop: 4 }]}>
                Es un indicador, no un veredicto: no afirma que el candidato haya hecho ni vaya a hacer nada.
              </Text>
            </View>
          </View>
        )}

        {/* ── Perfil por rasgo ── */}
        {m.rasgos.length > 0 && (
          <View style={s.seccion}>
            <View wrap={false}>
              <Text style={s.h2}>Perfil por rasgo</Text>
              <Text style={s.p}>
                Los estilos de trabajo no son capacidad: no hay perfiles buenos ni malos. Cada valor es el porcentaje del rasgo, no un percentil.
              </Text>
              {m.radar && <Radar rasgos={m.rasgos} objetivo={m.hayObjetivo} completo={m.objetivoCompleto} />}
            </View>

            {/* La tabla va en bloques, cada uno entero en una hoja y con su
                cabecera: si sigue en la página siguiente, la cabecera se
                repite y nunca queda sola. El primero es más corto para que
                entre debajo del gráfico. */}
            {bloques(m.rasgos, m.radar ? 4 : 7, 7).map((grupo, gi) => (
              <View key={gi} wrap={false}>
                <View style={s.thFila}>
                  <Text style={[s.th, { width: 18 }]}>#</Text>
                  <Text style={[s.th, { flex: 2.1 }]}>Rasgo{gi > 0 ? " (continuación)" : ""}</Text>
                  <Text style={[s.th, { flex: 1.25 }]}>Porcentaje</Text>
                  <Text style={[s.th, { flex: 3.4 }]}>Interpretación y comparación</Text>
                </View>
                {grupo.map((r) => (
                  <View key={r.key} style={s.fila}>
                    <Text style={[s.p, { width: 18, color: SUAVE }]}>{r.numero}</Text>
                    <Text style={[s.p, s.bold, { flex: 2.1, paddingRight: 8 }]}>{r.label}</Text>
                    <View style={{ flex: 1.25, paddingRight: 10 }}>
                      <Text style={s.p}>{r.pct}%</Text>
                      <Barra pct={r.pct} color={AZUL} />
                      {r.objetivo !== null && <Text style={[s.nota, { marginTop: 2 }]}>Pedido para el puesto: {r.objetivo}%</Text>}
                    </View>
                    <View style={{ flex: 3.4 }}>
                      <Text style={s.p}>{r.interpretacion}</Text>
                      <Text style={[s.nota, { marginTop: 2 }]}>{r.comparacion}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ── Complementos ── */}
        {m.videos > 0 && (
          <View style={s.seccion} wrap={false}>
            <Text style={s.h2}>Respuestas en video</Text>
            <Text style={s.p}>
              {m.videos === 1 ? "Hay 1 respuesta en video." : `Hay ${m.videos} respuestas en video.`} Se miran desde el informe en el panel de
              Worka Evaluar.
            </Text>
          </View>
        )}

        <View style={s.seccion} wrap={false}>
          <Text style={s.h2}>CV</Text>
          <Text style={s.p}>{m.cv}</Text>
        </View>

        <View style={s.seccion}>
          <Text style={s.h2} minPresenceAhead={30}>
            Notas del equipo
          </Text>
          {m.notas.length === 0 ? (
            <Text style={s.p}>Sin notas todavía.</Text>
          ) : (
            m.notas.map((n, i) => (
              <View key={i} style={{ borderLeftWidth: 2, borderLeftColor: "#c9d9ea", paddingLeft: 8, marginTop: 5 }} wrap={false}>
                <Text style={s.p}>{n.texto}</Text>
                {n.meta ? <Text style={[s.nota, { marginTop: 1 }]}>{n.meta}</Text> : null}
              </View>
            ))
          )}
        </View>

        {m.resolucion && (
          <View style={s.seccion} wrap={false}>
            <Text style={s.h2}>Resolución</Text>
            <Text style={s.p}>{m.resolucion}</Text>
          </View>
        )}

        <View style={s.seccion} wrap={false}>
          <Text style={s.h2}>Cómo leer este informe</Text>
          {m.guia.map((g, i) => (
            <View key={i} style={s.vineta}>
              <Text style={[s.p, { width: 10 }]}>•</Text>
              <Text style={[s.p, { flex: 1 }]}>{g}</Text>
            </View>
          ))}
          <View style={{ marginTop: 12, borderTopWidth: 0.75, borderTopColor: LINEA, paddingTop: 8 }}>
          <Text style={s.nota}>
            {m.advertencia}
            {m.alertas > 0
              ? ` En este caso, el control de calidad marcó ${m.alertas === 1 ? "una alerta" : `${m.alertas} alertas`}: conviene repreguntar en la entrevista antes de sacar conclusiones del perfil.`
              : ""}
          </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function bloques<T>(xs: T[], primero: number, resto: number): T[][] {
  const out: T[][] = [xs.slice(0, primero)];
  for (let i = primero; i < xs.length; i += resto) out.push(xs.slice(i, i + resto));
  return out.filter((g) => g.length > 0);
}

// Barra de 0 a 100. El cero conserva su pista visible y su número al lado.
function Barra({ pct, color }: { pct: number; color: string }) {
  const w = Math.max(0, Math.min(100, pct));
  return <View style={s.pista}>{w > 0 && <View style={[s.barra, { width: `${w}%`, backgroundColor: color }]} />}</View>;
}

// Radar vectorial. Los ejes llevan el número del rasgo (la tabla de abajo
// tiene el nombre completo): así no se cortan etiquetas largas y el gráfico
// y la tabla salen del mismo dato.
function Radar({ rasgos, objetivo, completo }: { rasgos: RasgoModelo[]; objetivo: boolean; completo: boolean }) {
  const W = 280;
  const H = 196;
  const cx = W / 2;
  const cy = H / 2 + 2;
  const R = 76;
  const n = rasgos.length;
  const ang = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pt = (i: number, v: number) => {
    const r = (Math.max(0, Math.min(100, v)) / 100) * R;
    return [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");

  return (
    <View style={{ alignItems: "center", marginTop: 8 }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {[25, 50, 75, 100].map((a) => (
          <Polygon key={a} points={poly(rasgos.map(() => a))} fill="none" stroke="#dedcd8" strokeWidth={0.6} />
        ))}
        {rasgos.map((_, i) => {
          const [x, y] = pt(i, 100);
          return <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e4e2de" strokeWidth={0.6} />;
        })}
        {/* Perfil del puesto: solo si es real. Completo, como polígono
            punteado; parcial, solo puntos huecos, sin cerrar la figura. */}
        {objetivo && completo && (
          <Polygon points={poly(rasgos.map((r) => r.objetivo ?? 0))} fill="none" stroke="#10b981" strokeWidth={1.2} strokeDasharray="3,2" />
        )}
        {objetivo &&
          !completo &&
          rasgos.map((r, i) => {
            if (r.objetivo === null) return null;
            const [x, y] = pt(i, r.objetivo);
            return <Circle key={`o${i}`} cx={x} cy={y} r={2.6} fill="#ffffff" stroke="#10b981" strokeWidth={1} />;
          })}
        <Polygon points={poly(rasgos.map((r) => r.pct))} fill={AZUL} fillOpacity={0.14} stroke={AZUL} strokeWidth={1.4} />
        {rasgos.map((r, i) => {
          const [x, y] = pt(i, r.pct);
          return <Circle key={`p${i}`} cx={x} cy={y} r={2.2} fill={AZUL} />;
        })}
        <G>
          {rasgos.map((r, i) => {
            const [x, y] = pt(i, 116);
            return (
              <Text key={`t${i}`} x={x} y={y + 3} style={{ fontSize: 8.5, fontFamily: "Inter", fontWeight: 700 }} fill={TINTA} textAnchor="middle">
                {String(r.numero)}
              </Text>
            );
          })}
        </G>
      </Svg>
      <View style={{ flexDirection: "row", marginTop: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginRight: 14 }}>
          <View style={{ width: 14, height: 2, backgroundColor: AZUL, marginRight: 4 }} />
          <Text style={s.nota}>Candidato (línea continua)</Text>
        </View>
        {objetivo && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 14, height: 0, borderTopWidth: 1.2, borderTopColor: "#10b981", borderStyle: "dashed", marginRight: 4 }} />
            <Text style={s.nota}>Lo pedido para el puesto ({completo ? "línea punteada" : "puntos huecos, parcial"})</Text>
          </View>
        )}
      </View>
      <Text style={[s.nota, { marginTop: 3, textAlign: "center" }]}>
        Escala de 0 a 100% desde el centro. Los números de los ejes corresponden a la tabla de abajo.
      </Text>
    </View>
  );
}
