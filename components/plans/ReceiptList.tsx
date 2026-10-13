import Link from "next/link";
import { FileText } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { formatReceiptNumber } from "@/lib/receipts";
import type { ReceiptSummary } from "@/lib/receipts-server";

// Lista de recibos digitales con enlace a cada uno.
export default function ReceiptList({ receipts }: { receipts: ReceiptSummary[] }) {
  if (receipts.length === 0) return null;
  return (
    <div className="mt-5">
      <h3 className="font-semibold text-sm">Recibos</h3>
      <ul className="mt-2 space-y-2">
        {receipts.map((r) => (
          <li key={r.id}>
            <Link href={`/recibo/${r.id}`} className="flex items-start gap-2 text-sm hover:text-primary">
              <FileText size={15} className="mt-0.5 shrink-0" />
              <span className="min-w-0">
                <span className="font-medium">Nº {formatReceiptNumber(r.number)}</span>
                {r.status === "anulado" && <span className="text-red-600"> · anulado</span>}
                <span className="block text-xs text-muted truncate">
                  {formatMoney({ amount: r.total, currency: r.currency })} · {new Date(r.issued_at).toLocaleDateString("es-PY")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
