import { Fragment } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";

// Renderer de Markdown de las lecciones. Mismo enfoque que BlogContent (sin
// dangerouslySetInnerHTML, nada de HTML crudo) y los mismos estilos, pero con
// lo que usan los cursos nuevos: tablas, listas numeradas, citas de varios
// párrafos, *cursiva*, `código` y [enlaces](url). Lo que BlogContent ya
// sabía hacer se ve igual.

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
      return (
        <strong key={key} className="font-semibold text-primary-dark">
          {renderInline(part.slice(2, -2), key)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return (
        <code key={key} className="px-1.5 py-0.5 rounded bg-gray-100 text-[0.85em] font-mono text-gray-800 break-all">
          {part.slice(1, -1)}
        </code>
      );
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const href = link[2];
      if (href.startsWith("/"))
        return (
          <Link key={key} href={href} className="text-primary font-medium underline underline-offset-2">
            {link[1]}
          </Link>
        );
      if (/^https?:\/\//.test(href))
        return (
          <a key={key} href={href} target="_blank" rel="noopener" className="text-primary font-medium underline underline-offset-2">
            {link[1]}
          </a>
        );
      return <Fragment key={key}>{link[1]}</Fragment>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={key}>{renderInline(part.slice(1, -1), key)}</em>;
    return <Fragment key={key}>{part}</Fragment>;
  });
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

// Bloque de la lección 5.4: cómo reportar en Worka un aviso sospechoso.
function ReportCallout() {
  return (
    <div className="my-5 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
      <span className="w-9 h-9 rounded-full bg-white text-red-600 grid place-items-center shrink-0">
        <Flag size={17} />
      </span>
      <div className="text-sm text-gray-700">
        <p className="font-semibold text-primary-dark">Reportar un aviso sospechoso en Worka</p>
        <p className="mt-1">
          En cada vacante tenés el botón <strong>«Reportar un problema»</strong>. Elegí el motivo «Parece una estafa» o
          «Piden dinero o inversión inicial»: el equipo de Worka lo revisa y, con varios reportes, la vacante se oculta sola.
        </p>
        <Link href="/empleos" className="inline-block mt-2 font-semibold text-primary underline underline-offset-2">
          Ir a las vacantes de Worka
        </Link>
      </div>
    </div>
  );
}

export default function LessonContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.trim() === "[[reportar-aviso]]") {
      blocks.push(<ReportCallout key={key++} />);
      i++;
      continue;
    }

    // Tabla: fila de encabezado + separador |---|
    if (line.startsWith("|") && /^\|?\s*:?-{2,}/.test((lines[i + 1] ?? "").trim())) {
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      const k = key++;
      blocks.push(
        <div key={k} className="my-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm min-w-[420px]">
            <thead className="bg-gray-50">
              <tr>
                {head.map((h, hi) => (
                  <th key={hi} className="text-left font-semibold text-primary-dark px-3.5 py-2.5">
                    {renderInline(h, `th-${k}-${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="px-3.5 py-2.5 text-gray-700 align-top">
                      {renderInline(c, `td-${k}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Cita (puede tener varios párrafos separados por «>» vacío).
    if (line.startsWith(">")) {
      const paras: string[][] = [[]];
      while (i < lines.length && lines[i].trimEnd().startsWith(">")) {
        const t = lines[i].trimEnd().replace(/^>\s?/, "");
        if (t.trim() === "") paras.push([]);
        else paras[paras.length - 1].push(t);
        i++;
      }
      const k = key++;
      blocks.push(
        <blockquote key={k} className="border-l-4 border-primary bg-blue-50 rounded-r-xl px-4 py-3 my-4 text-sm text-primary-dark space-y-2">
          {paras
            .filter((p) => p.length)
            .map((p, pi) => (
              <p key={pi}>{renderInline(p.join(" "), `q-${k}-${pi}`)}</p>
            ))}
        </blockquote>
      );
      continue;
    }

    // Listas con viñetas o numeradas.
    const ulItem = /^\s*[-*] /;
    const olItem = /^\s*\d+\. /;
    if (ulItem.test(line) || olItem.test(line)) {
      const ordered = olItem.test(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? olItem : ulItem).test(lines[i])) {
        items.push(lines[i].replace(ordered ? olItem : ulItem, "").trim());
        i++;
      }
      const k = key++;
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={k} className={`${ordered ? "list-decimal" : "list-disc"} pl-5 space-y-1.5 my-4 text-gray-700`}>
          {items.map((it, ii) => (
            <li key={ii}>{renderInline(it, `li-${k}-${ii}`)}</li>
          ))}
        </Tag>
      );
      continue;
    }

    if (line.startsWith("### ") || line.startsWith("#### ")) {
      blocks.push(
        <h3 key={key++} className="text-lg font-bold text-primary-dark mt-6 mb-2">
          {renderInline(line.replace(/^#{3,4} /, ""), `h3-${key}`)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="text-xl sm:text-2xl font-bold text-primary-dark mt-8 mb-3">
          {renderInline(line.slice(3), `h2-${key}`)}
        </h2>
      );
      i++;
      continue;
    }

    // Párrafo: líneas seguidas hasta una vacía o el inicio de otro bloque.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(>|\||#{2,4} |\s*[-*] |\s*\d+\. |\[\[)/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    if (para.length === 0) {
      // Línea que no encaja en nada: se muestra como texto.
      para.push(line.trim());
      i++;
    }
    blocks.push(
      <p key={key++} className="text-gray-700 leading-relaxed my-3">
        {renderInline(para.join(" "), `p-${key}`)}
      </p>
    );
  }

  return <div className="text-[0.95rem]">{blocks}</div>;
}
