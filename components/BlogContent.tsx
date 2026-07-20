import { Fragment } from "react";

// Renderer de markdown liviano y seguro (no usa dangerouslySetInnerHTML).
// Soporta: ## y ### (títulos), - (listas), > (cita), **negrita**, y párrafos.
function renderInline(text: string, keyBase: string) {
  // Divide por **negrita** y alterna normal/strong.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyBase}-${i}`} className="font-semibold text-primary-dark">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={`${keyBase}-${i}`}>{part}</Fragment>;
  });
}

export default function BlogContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  function flushList() {
    if (list.length === 0) return;
    const items = [...list];
    blocks.push(
      <ul key={`ul-${key++}`} className="list-disc pl-5 space-y-1.5 my-4 text-gray-700">
        {items.map((it, i) => (
          <li key={i}>{renderInline(it, `li-${key}-${i}`)}</li>
        ))}
      </ul>
    );
    list = [];
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }
    flushList();
    if (line.trim() === "") continue;
    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="text-lg font-bold text-primary-dark mt-6 mb-2">
          {renderInline(line.slice(4), `h3-${key}`)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="text-xl sm:text-2xl font-bold text-primary-dark mt-8 mb-3">
          {renderInline(line.slice(3), `h2-${key}`)}
        </h2>
      );
    } else if (line.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-4 border-primary bg-blue-50 rounded-r-xl px-4 py-3 my-4 text-sm text-primary-dark"
        >
          {renderInline(line.slice(2), `q-${key}`)}
        </blockquote>
      );
    } else {
      blocks.push(
        <p key={key++} className="text-gray-700 leading-relaxed my-3">
          {renderInline(line, `p-${key}`)}
        </p>
      );
    }
  }
  flushList();

  return <div className="text-[0.95rem]">{blocks}</div>;
}
