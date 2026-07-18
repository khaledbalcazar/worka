"use client";

// Comprime una imagen en el navegador ANTES de subirla: la redimensiona a un
// ancho/alto máximo y la re-codifica como JPEG con calidad reducida.
// Baja fotos de celular de ~8 MB a ~200-500 KB → sube más rápido y el servidor
// procesa menos. Si algo falla, devuelve el archivo original sin romper el flujo.
export async function compressImage(
  file: File,
  opts: { maxSize?: number; quality?: number; maxBytes?: number } = {}
): Promise<File> {
  const { maxSize = 1600, quality = 0.7 } = opts;

  // Solo comprimimos imágenes de mapa de bits. PDFs u otros: se devuelven igual.
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > maxSize || height > maxSize) {
      const scale = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // Fondo blanco por si la imagen original tiene transparencia (PNG).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
