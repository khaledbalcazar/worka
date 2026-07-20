import { ImageResponse } from "next/og";
import { getJobById, getSiteSettings } from "@/lib/data";

// Imagen para redes de cada vacante, en una ruta NAVEGABLE: /empleo/[id]/og
// Se usa como og:image (preview al compartir en WhatsApp/Facebook) y también
// se puede abrir/descargar desde el menú de la tarjeta.
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [job, settings] = await Promise.all([
    getJobById(id),
    getSiteSettings(),
  ]);
  const siteName = settings.site_name || "Worka";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          padding: 64,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                background: "white",
                color: "#1e3a8a",
                fontWeight: 800,
                fontSize: 36,
                padding: "8px 24px",
                borderRadius: 16,
              }}
            >
              {siteName}
            </div>
            <div style={{ fontSize: 28, color: "#bfdbfe" }}>Tu próximo paso</div>
          </div>

          <div
            style={{
              fontSize: job && job.title.length > 40 ? 56 : 72,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 1000,
            }}
          >
            {job?.title ?? "Empleos en Paraguay"}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: "#bfdbfe",
              marginTop: 24,
            }}
          >
            {job
              ? `${job.company.trade_name} · ${job.company.location_city}`
              : "Vacantes verificadas, 100% gratis"}
          </div>

          {job?.salary_range && (
            <div
              style={{
                display: "flex",
                marginTop: 28,
                background: "#10b981",
                color: "white",
                fontSize: 34,
                fontWeight: 700,
                padding: "12px 28px",
                borderRadius: 999,
                alignSelf: "flex-start",
              }}
            >
              {job.salary_range}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 30,
            color: "#bfdbfe",
          }}
        >
          <div>Postulate gratis en worka.click</div>
          <div style={{ display: "flex", gap: 24 }}>
            {job && !job.requires_experience && <div>Sin experiencia</div>}
            {job?.urgent && <div>Contratación inmediata</div>}
          </div>
        </div>
      </div>
    ),
    size
  );
}
