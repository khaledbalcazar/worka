import React from 'react';
import { Lightbulb, Quote } from 'lucide-react';

// Bloques del Manual oficial, tal como los produce scripts/extract-manual.mjs.
export type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'p'; text: string; style?: string }
  | { type: 'li'; text: string }
  | { type: 'callout'; tag: string; text: string }
  | { type: 'quote'; text: string }
  | { type: 'pre'; text: string }
  | { type: 'table'; rows: string[][] };

export type GroupedBlock = Block | { type: 'ul'; items: string[] };

// Agrupa bloques "li" consecutivos en una sola lista <ul>.
export function groupBlocks(blocks: Block[]): GroupedBlock[] {
  const out: GroupedBlock[] = [];
  for (const b of blocks) {
    if (b.type === 'li') {
      const last = out[out.length - 1];
      if (last && last.type === 'ul') last.items.push(b.text);
      else out.push({ type: 'ul', items: [b.text] });
    } else {
      out.push(b);
    }
  }
  return out;
}

export function blocksToPlainText(blocks: Block[]): string {
  return blocks
    .map((b) => (b.type === 'table' ? b.rows.map((r) => r.join(' ')).join(' ') : 'text' in b ? b.text : ''))
    .join(' ');
}

export const BlockRenderer: React.FC<{ block: GroupedBlock }> = ({ block }) => {
  switch (block.type) {
    case 'heading': {
      const level = block.level;
      const cls =
        level <= 1
          ? 'font-serif text-lg font-bold text-[#d4af37] mt-6 mb-2 first:mt-0'
          : level === 2
            ? 'font-serif text-base font-semibold text-[#e4c766] mt-5 mb-1.5'
            : 'font-serif text-sm font-semibold text-[#c9a862] mt-4 mb-1';
      return <p className={cls}>{block.text}</p>;
    }
    case 'p':
      return <p className="text-[#d4d4d8] leading-relaxed mb-3">{block.text}</p>;
    case 'ul':
      return (
        <ul className="list-disc pl-5 space-y-1 mb-3 text-[#d4d4d8]">
          {block.items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {it}
            </li>
          ))}
        </ul>
      );
    case 'callout':
      return (
        <div className="flex gap-2.5 bg-[#d4af37]/10 border border-[#d4af37]/25 rounded-xl px-4 py-3 mb-3">
          <Lightbulb className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[#d4af37] uppercase tracking-wide mb-1">{block.tag}</p>
            <p className="text-[#e4e4e7] leading-relaxed text-sm">{block.text}</p>
          </div>
        </div>
      );
    case 'quote':
      return (
        <blockquote className="flex gap-2.5 border-l-2 border-[#3f3f46] pl-4 py-1 mb-3 italic">
          <Quote className="w-4 h-4 text-[#71717a] shrink-0 mt-1" />
          <p className="text-[#a1a1aa] leading-relaxed text-sm">{block.text}</p>
        </blockquote>
      );
    case 'pre':
      return (
        <pre className="bg-[#0a0a0c] border border-[#27272a] rounded-lg p-3 mb-3 text-xs text-[#a1a1aa] overflow-x-auto font-mono leading-relaxed whitespace-pre">
          {block.text}
        </pre>
      );
    case 'table': {
      const [head, ...body] = block.rows;
      return (
        <div className="overflow-x-auto mb-4 rounded-lg border border-[#27272a]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#1a1a1f]">
                {head.map((c, i) => (
                  <th
                    key={i}
                    className="text-left px-3 py-2 font-semibold text-[#d4af37] border-b border-[#27272a] whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className={ri % 2 ? 'bg-[#121216]' : 'bg-[#0e0e11]'}>
                  {row.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 text-[#d4d4d8] align-top border-b border-[#1a1a1f]">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    default:
      return null;
  }
};

// Renderiza una lista de bloques ya agrupada.
export const ManualBlocks: React.FC<{ blocks: Block[] }> = ({ blocks }) => (
  <>
    {groupBlocks(blocks).map((b, i) => (
      <BlockRenderer key={i} block={b} />
    ))}
  </>
);
