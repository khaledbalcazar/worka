import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Ban, XCircle } from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import { verifyReceipt } from "@/lib/receipts-server";
import { formatReceiptNumber, groupCode, isReceiptCode } from "@/lib/receipts";
import { formatMoney } from "@/lib/currency";

export const metadata: Metadata = { title: "Verificar recibo", robots: { index: false } };

// Destino del QR de los recibos digitales: confirma que el recibo existe y
// muestra lo justo (número, fecha, concepto, monto y nombre parcial).
export default async function VerifyReceiptPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = decodeURIComponent(code).replace(/\s+/g, "").toUpperCase();
  const receipt = isReceiptCode(clean) ? await verifyReceipt(clean) : null;
  const valid = receipt && receipt.status === "emitido";

  return (
    <main className="flex-1 bg-surface min-h-screen flex flex-col">
      <HomeNav />
      <div className="max-w-xl mx-auto w-full px-4 py-12">
        <div className="card p-6 sm:p-8 text-center">
          {!receipt ? (
            <>
              <XCircle size={44} className="mx-auto text-clay" />
              <h1 className="text-2xl font-semibold mt-3">No encontramos este recibo</h1>
              <p className="text-muted mt-2">Revisá que el código esté completo (20 caracteres, como aparece debajo del QR).</p>
            </>
          ) : (
            <>
              {valid ? <BadgeCheck size={44} className="mx-auto text-success-ink" /> : <Ban size={44} className="mx-auto text-clay" />}
              <h1 className="text-2xl font-semibold mt-3">{valid ? "Recibo válido" : "Recibo anulado"}</h1>
              <dl className="text-left text-sm mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <dt className="text-muted">Número</dt>
                <dd className="font-semibold">{formatReceiptNumber(receipt.number)}</dd>
                <dt className="text-muted">Emitido</dt>
                <dd>{new Date(receipt.issued_at).toLocaleString("es-PY", { dateStyle: "long", timeStyle: "short", timeZone: "America/Asuncion" })}</dd>
                <dt className="text-muted">Cliente</dt>
                <dd>{receipt.customer}</dd>
                <dt className="text-muted">Concepto</dt>
                <dd>{receipt.concept}</dd>
                <dt className="text-muted">Monto</dt>
                <dd className="font-semibold">{formatMoney({ amount: receipt.total, currency: receipt.currency })}</dd>
              </dl>
              <p className="text-xs text-muted mt-5">
                Recibo digital emitido por Worka · <strong>sin valor fiscal</strong> · {groupCode(clean)}
              </p>
            </>
          )}
          <Link href="/" className="btn-secondary mt-6">Ir a Worka</Link>
        </div>
      </div>
    </main>
  );
}
