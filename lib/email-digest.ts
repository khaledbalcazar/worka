import "server-only";

/* Plantilla del correo de novedades.
 *
 * Todo va con tablas y estilos en línea porque los clientes de correo no son
 * navegadores: Outlook de escritorio renderiza con el motor de Word, Gmail
 * borra las hojas de estilo y ninguno de los dos entiende flexbox ni grid.
 * Lo que acá parece HTML de 2005 es lo único que se ve igual en los tres.
 */

export interface DigestJob {
  title: string;
  company: string;
  companyLogo: string | null;
  city: string;
  modality: string | null;
  salary: string | null;
  href: string;
  verified: boolean;
  urgent: boolean;
  /* Por qué esta vacante está en el correo de esta persona. Es un motivo
     real y no un porcentaje: un "87% de coincidencia" inventado se nota, y
     cuando alguien abre la vacante y no coincide, el número deja de valer
     para siempre. */
  motivo: string | null;
}

const AZUL = "#2563eb";
const AZUL_OSCURO = "#1e3a8a";
const TINTA = "#0f172a";
const GRIS = "#64748b";
const GRIS_CLARO = "#94a3b8";
const LINEA = "#e2e8f0";
const FONDO = "#f1f5f9";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Colores del recuadro con la inicial, cuando la empresa no cargó logo.
// Salen del nombre para que la misma empresa tenga siempre el mismo color.
const PALETA = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#db2777", "#0891b2"];
function colorDe(nombre: string): string {
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) | 0;
  return PALETA[Math.abs(h) % PALETA.length];
}

/* Logo de la empresa.
 *
 * Va dentro de una celda con color de fondo y la inicial escrita debajo: casi
 * todos los clientes bloquean las imágenes hasta que la persona toca "mostrar
 * imágenes", así que si el logo fuera lo único, la mitad de los correos se
 * verían con agujeros blancos. Con este armado, la imagen bloqueada deja ver
 * el cuadrado de color con la letra, que es exactamente lo que se muestra
 * cuando la empresa ni siquiera tiene logo. */
function logo(nombre: string, url: string | null, lado: number): string {
  const color = colorDe(nombre);
  const inicial = esc((nombre.trim()[0] ?? "?").toUpperCase());
  const fuente = Math.round(lado * 0.42);

  if (!url) {
    return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" bgcolor="${color}" style="background:${color};border-radius:${Math.round(lado / 4)}px;">
      <tr><td width="${lado}" height="${lado}" align="center" valign="middle" style="color:#ffffff;font-weight:700;font-size:${fuente}px;line-height:${lado}px;">${inicial}</td></tr>
    </table>`;
  }

  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" bgcolor="${color}" style="background:${color};border-radius:${Math.round(lado / 4)}px;overflow:hidden;">
    <tr><td width="${lado}" height="${lado}" align="center" valign="middle" style="color:#ffffff;font-weight:700;font-size:${fuente}px;line-height:${lado}px;">
      <img src="${esc(url)}" width="${lado}" height="${lado}" alt="${inicial}" style="display:block;width:${lado}px;height:${lado}px;border:0;border-radius:${Math.round(lado / 4)}px;object-fit:cover;" />
    </td></tr>
  </table>`;
}

function chip(texto: string): string {
  return `<span style="display:inline-block;margin:2px 6px 2px 0;padding:4px 10px;border:1px solid ${LINEA};border-radius:9999px;background:#f8fafc;color:#475569;font-size:11px;font-weight:600;line-height:1.2;">${esc(texto)}</span>`;
}

function selloVerificada(): string {
  return `<span style="display:inline-block;margin-left:6px;color:#059669;font-size:12px;font-weight:700;">&#10003; Verificada</span>`;
}

function boton(href: string, texto: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" align="center" style="margin:0 auto;">
    <tr><td align="center" bgcolor="${AZUL}" style="background:${AZUL};border-radius:10px;">
      <a href="${esc(href)}" style="display:inline-block;padding:14px 34px;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">${esc(texto)}</a>
    </td></tr>
  </table>`;
}

/* Vacante destacada: la primera de la lista, con el logo grande. */
function tarjetaDestacada(j: DigestJob): string {
  // El salario es texto libre que escribe la empresa: hay avisos con
  // "Gs. 2.800.000 + bonificaciones + comisiones por venta". Dentro de una
  // pastilla redondeada eso se parte en tres renglones y deja de parecer una
  // pastilla, así que se corta.
  const salario =
    j.salary && j.salary.length > 28 ? `${j.salary.slice(0, 27)}…` : j.salary;
  const chips = [j.city, j.modality, salario].filter(Boolean) as string[];
  return `<table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="margin:0 0 20px 0;border:1px solid ${LINEA};border-radius:18px;" bgcolor="#ffffff">
    <tr><td style="padding:22px 24px;background:#ffffff;border-radius:18px;">
      ${
        j.motivo
          ? `<p style="margin:0 0 14px 0;"><span style="display:inline-block;padding:5px 12px;border-radius:9999px;background:${AZUL};color:#ffffff;font-size:11px;font-weight:700;letter-spacing:.04em;">${esc(j.motivo)}</span></p>`
          : ""
      }
      <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
        <tr>
          <td width="60" valign="top" style="padding-right:14px;">${logo(j.company, j.companyLogo, 52)}</td>
          <td valign="top">
            <p style="margin:0 0 3px 0;font-size:13px;color:${GRIS};font-weight:600;">
              <strong style="color:${TINTA};font-weight:700;">${esc(j.company)}</strong>${j.verified ? selloVerificada() : ""}
            </p>
            <h2 style="margin:0 0 10px 0;font-size:21px;font-weight:700;color:${TINTA};letter-spacing:-.01em;line-height:1.25;">${esc(j.title)}${j.urgent ? ' <span style="font-size:13px;color:#dc2626;font-weight:700;">&#9889; Urgente</span>' : ""}</h2>
            <p style="margin:0;">${chips.map(chip).join("")}</p>
          </td>
        </tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:20px 0 0 0;">
        <tr><td bgcolor="${AZUL}" style="background:${AZUL};border-radius:9px;">
          <a href="${esc(j.href)}" style="display:inline-block;padding:11px 26px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">Ver la vacante</a>
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

/* Las demás, en filas compactas. */
function fila(j: DigestJob): string {
  return `<a href="${esc(j.href)}" style="text-decoration:none;display:block;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="margin:8px 0;border:1px solid ${LINEA};border-radius:14px;" bgcolor="#ffffff">
      <tr><td style="padding:13px 15px;background:#ffffff;border-radius:14px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
          <tr>
            <td width="52" valign="middle" style="padding-right:12px;">${logo(j.company, j.companyLogo, 40)}</td>
            <td valign="middle">
              <p style="margin:0;font-size:14px;font-weight:700;color:${TINTA};line-height:1.35;">${esc(j.title)}</p>
              <p style="margin:4px 0 0 0;font-size:12px;color:${GRIS};line-height:1.5;">
                <span style="color:${GRIS};">${esc(j.company)}</span>${j.verified ? selloVerificada() : ""}
                ${j.city ? chip(j.city) : ""}
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </a>`;
}

export function digestHtml(opts: {
  nombre: string;
  jobs: DigestJob[];
  totalNuevas: number;
  verTodasUrl: string;
  preferenciasUrl: string;
  bajaUrl: string;
  ciudad: string | null;
}): string {
  const [destacada, ...resto] = opts.jobs;
  const plural = opts.totalNuevas === 1 ? "" : "s";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<title>Vacantes nuevas en Worka</title>
</head>
<body style="margin:0;padding:0;background:${FONDO};-webkit-font-smoothing:antialiased;">
<!-- Renglón de vista previa: es lo que se lee en la bandeja debajo del
     asunto. Sin esto el cliente toma el primer texto que encuentra, que
     suele ser "Ver en el navegador" o el nombre de la empresa. -->
<div style="display:none;font-size:1px;color:${FONDO};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  ${opts.totalNuevas} vacante${plural} nueva${plural} de empresas verificadas${opts.ciudad ? ` en ${esc(opts.ciudad)}` : ""}. Postulate en un toque, sin costo.
</div>

<table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" bgcolor="${FONDO}" style="background:${FONDO};">
<tr><td align="center" style="padding:28px 14px;">

<table cellpadding="0" cellspacing="0" border="0" width="600" role="presentation" style="max-width:600px;width:100%;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">

  <!-- Marca -->
  <tr><td style="padding:6px 4px 14px 4px;">
    <a href="${esc(opts.verTodasUrl)}" style="text-decoration:none;color:${AZUL_OSCURO};font-size:22px;font-weight:800;letter-spacing:-.5px;">Work<span style="color:${AZUL};">a</span></a>
  </td></tr>

  <!-- Tarjeta principal -->
  <tr><td bgcolor="#ffffff" style="background:#ffffff;border-radius:18px;overflow:hidden;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
      <tr><td height="4" bgcolor="${AZUL}" style="background:${AZUL};line-height:4px;font-size:4px;">&nbsp;</td></tr>
      <tr><td style="padding:32px 28px 26px 28px;color:${TINTA};">

        <p style="margin:0 0 10px 0;font-size:15px;color:${TINTA};font-weight:600;">Hola ${esc(opts.nombre)},</p>

        <h1 style="margin:0 0 12px 0;font-size:30px;font-weight:800;color:${TINTA};letter-spacing:-.02em;line-height:1.15;">
          Hay trabajo nuevo<br><span style="color:${AZUL};">en Worka.</span>
        </h1>
        <p style="margin:0 0 24px 0;font-size:15px;color:${GRIS};line-height:1.6;">
          Esta semana se publicaron <strong style="color:${TINTA};">${opts.totalNuevas} vacante${plural}</strong> de empresas con RUC verificado${opts.ciudad ? ` cerca de <strong style="color:${TINTA};">${esc(opts.ciudad)}</strong>` : ""}. Estas son las que más te pueden servir.
        </p>

        ${destacada ? tarjetaDestacada(destacada) : ""}

        ${
          resto.length > 0
            ? `<p style="margin:24px 0 4px 0;font-size:14px;font-weight:700;color:${TINTA};">Otras ${resto.length} para mirar</p>
               <p style="margin:0 0 10px 0;font-size:12px;color:${GRIS_CLARO};">Todas de empresas verificadas</p>
               ${resto.map(fila).join("")}`
            : ""
        }

        <!-- Cierre -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="margin:26px 0 6px 0;border-radius:16px;" bgcolor="#f8fafc">
          <tr><td align="center" style="padding:26px 22px;background:#f8fafc;border-radius:16px;">
            <h3 style="margin:0 0 6px 0;font-size:19px;font-weight:700;color:${TINTA};letter-spacing:-.01em;">Mirá el resto cuando puedas.</h3>
            <p style="margin:0 0 18px 0;font-size:14px;color:${GRIS};">Postularte lleva un toque y no cuesta nada.</p>
            ${boton(opts.verTodasUrl, "Ver todas las vacantes")}
            <!-- Los tres sellos van en un párrafo y no en una tabla de tres
                 columnas: en el celular esas columnas quedan de 90px y parten
                 "Postulás con tu perfil" en cuatro renglones. Así se acomodan
                 solos, en una línea en la computadora y en dos en el teléfono. -->
            <p style="margin:18px 0 0 0;font-size:12px;color:${GRIS};font-weight:500;line-height:2;">
              <span style="white-space:nowrap;"><span style="color:#059669;">&#10003;</span> Empresas con RUC</span>
              &nbsp;&nbsp;<span style="white-space:nowrap;"><span style="color:#059669;">&#10003;</span> Postulás con tu perfil</span>
              &nbsp;&nbsp;<span style="white-space:nowrap;"><span style="color:#059669;">&#10003;</span> 100% gratis</span>
            </p>
          </td></tr>
        </table>

      </td></tr>
    </table>
  </td></tr>

  <!-- Pie -->
  <tr><td align="center" style="padding:22px 16px 8px 16px;">
    <p style="margin:0;color:${GRIS_CLARO};font-size:12px;line-height:1.6;">
      Recibís este correo porque tenés una cuenta en Worka.
    </p>
    <p style="margin:8px 0 0 0;font-size:11px;">
      <a href="${esc(opts.preferenciasUrl)}" style="color:${GRIS};text-decoration:underline;font-weight:500;">Ajustar mis alertas</a>
      &nbsp;&middot;&nbsp;
      <a href="${esc(opts.bajaUrl)}" style="color:${GRIS};text-decoration:underline;font-weight:500;">Darme de baja</a>
    </p>
    <p style="margin:14px 0 0 0;color:${GRIS_CLARO};font-size:11px;">&copy; ${new Date().getFullYear()} Worka &middot; La bolsa de trabajo de Paraguay</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// Versión en texto plano. No es un adorno: sin ella el correo puntúa peor en
// los filtros de spam y los lectores en modo texto muestran el HTML crudo.
export function digestTexto(opts: {
  nombre: string;
  jobs: DigestJob[];
  totalNuevas: number;
  verTodasUrl: string;
  bajaUrl: string;
}): string {
  const plural = opts.totalNuevas === 1 ? "" : "s";
  const lineas = opts.jobs.map(
    (j, i) =>
      `${i + 1}. ${j.title} — ${j.company}${j.verified ? " (verificada)" : ""}${j.city ? ` · ${j.city}` : ""}\n   ${j.href}`
  );
  return [
    `Hola ${opts.nombre},`,
    "",
    `Esta semana se publicaron ${opts.totalNuevas} vacante${plural} de empresas con RUC verificado en Worka. Estas son las que más te pueden servir:`,
    "",
    ...lineas,
    "",
    `Ver todas las vacantes: ${opts.verTodasUrl}`,
    "",
    "Recibís este correo porque tenés una cuenta en Worka.",
    `Darte de baja: ${opts.bajaUrl}`,
  ].join("\n");
}
