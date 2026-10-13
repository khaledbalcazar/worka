import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PrintButton from "@/components/receipts/PrintButton";
import { getReceiptForViewer, receiptQrSvg, verifyUrl } from "@/lib/receipts-server";
import { amountInWords, formatReceiptNumber, groupCode } from "@/lib/receipts";
import { formatMoney } from "@/lib/currency";
import { getSiteSettings, isLive } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { CANONICAL_URL } from "@/lib/supabase/config";
import "./receipt.css";

export const metadata: Metadata = { title: "Recibo digital", robots: { index: false } };

const CURRENCY_LABEL: Record<string, string> = {
  PYG: "PYG - Guaraní",
  ARS: "ARS - Peso argentino",
  MXN: "MXN - Peso mexicano",
  COP: "COP - Peso colombiano",
  CLP: "CLP - Peso chileno",
  BOB: "BOB - Boliviano",
};

// Recibo digital de Worka, con el formato de un KuDE: datos del emisor y del
// cliente, detalle, total en letras y QR para verificar. Sin valor fiscal.
export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isLive() && !(await getCurrentUser())) redirect(`/ingresar?next=/recibo/${id}`);
  const receipt = await getReceiptForViewer(id);
  if (!receipt) notFound();

  const [qr, settings] = await Promise.all([receiptQrSvg(receipt.code), getSiteSettings()]);
  const money = (amount: number) => formatMoney({ amount, currency: receipt.currency });
  const issued = new Date(receipt.issued_at);
  const when = `${issued.toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Asuncion" })} - ${issued.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "America/Asuncion" })}`;
  const host = CANONICAL_URL.replace(/^https?:\/\//, "");

  return (
    <main className="rcpt-page">
      <div className="rcpt-actions print:hidden">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><ArrowLeft size={16} /> Volver a Worka</Link>
        <PrintButton />
      </div>

      <article className="rcpt" aria-label={`Recibo digital ${formatReceiptNumber(receipt.number)}`}>
        {receipt.status === "anulado" && <div className="rcpt-void" aria-hidden="true">ANULADO</div>}
        <p className="rcpt-band">Recibo digital · Sin valor fiscal</p>

        <div className="rcpt-head">
          <div className="rcpt-box rcpt-issuer">
            <div className="rcpt-logo">Work<span>a</span></div>
            <div>
              <p className="font-bold">WORKA</p>
              <p>Plataforma de empleo</p>
              <p>{host}</p>
              {settings.contact_email && <p>{settings.contact_email}</p>}
              <p>Asunción - Paraguay</p>
            </div>
          </div>
          <div className="rcpt-box rcpt-number">
            <p className="rcpt-doc">RECIBO DIGITAL Nº</p>
            <p className="rcpt-num">{formatReceiptNumber(receipt.number)}</p>
            <p className="rcpt-nofiscal">SIN VALOR FISCAL</p>
            <p className="text-xs">Comprobante de pago · no reemplaza a una factura</p>
          </div>
        </div>

        <div className="rcpt-box rcpt-customer">
          <p><b>Fecha y hora de emisión:</b> {when}</p>
          <p><b>Moneda:</b> {CURRENCY_LABEL[receipt.currency] ?? receipt.currency}</p>
          <p><b>Nombre o razón social:</b> {receipt.customer_name}</p>
          <p><b>RUC / CI:</b> {receipt.customer_doc || "—"}</p>
          {receipt.customer_email && <p><b>Correo electrónico:</b> {receipt.customer_email}</p>}
          <p><b>Condición:</b> Contado</p>
          <p><b>Tipo de operación:</b> Venta de servicios digitales</p>
          {receipt.payment_reference && <p><b>Referencia de pago:</b> {receipt.payment_reference}</p>}
        </div>

        <table className="rcpt-table">
          <thead>
            <tr>
              <th className="text-left">Descripción</th>
              <th>Cant.</th>
              <th>Precio unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">{money(item.unit_price)}</td>
                <td className="text-right">{money(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}><b>SUBTOTAL</b></td>
              <td className="text-right">{money(receipt.total)}</td>
            </tr>
            <tr>
              <td colSpan={3}><b>TOTAL PAGADO</b></td>
              <td className="text-right"><b>{money(receipt.total)}</b></td>
            </tr>
            <tr>
              <td colSpan={4}><b>TOTAL EN LETRAS:</b> {amountInWords(receipt.total, receipt.currency)}</td>
            </tr>
            {receipt.currency !== "PYG" && (
              <tr>
                <td colSpan={4}>Equivalente cobrado en guaraníes: {formatMoney({ amount: receipt.total_gs, currency: "PYG" })}</td>
              </tr>
            )}
          </tfoot>
        </table>

        <div className="rcpt-verify">
          <div className="rcpt-qr" dangerouslySetInnerHTML={{ __html: qr }} />
          <div className="min-w-0">
            <p className="font-semibold">Consultá la validez de este recibo escaneando el QR o en:</p>
            <p className="rcpt-url">{verifyUrl(receipt.code).replace(/^https?:\/\//, "").replace(/\/[^/]+$/, "/")}</p>
            <p className="font-semibold mt-1">Código de verificación:</p>
            <p className="rcpt-code">{groupCode(receipt.code)}</p>
          </div>
        </div>

        <footer className="rcpt-legal">
          <p><b>ESTE DOCUMENTO ES UN RECIBO DIGITAL SIN VALOR FISCAL.</b></p>
          <p>Acredita el pago de servicios contratados en Worka. No es una factura ni un comprobante de venta habilitado por la autoridad tributaria, y no sirve para crédito fiscal.</p>
          <p>Ante cualquier error en este recibo, escribinos dentro de las 72 horas siguientes a su emisión{settings.contact_email ? ` a ${settings.contact_email}` : ""}.</p>
        </footer>
      </article>
    </main>
  );
}
