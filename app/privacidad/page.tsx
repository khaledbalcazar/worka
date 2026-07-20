import { getSiteSettings } from "@/lib/data";
import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Política de privacidad" };
export const revalidate = 300;

const FALLBACK = `En Worka cuidamos tus datos personales.

1. Qué datos guardamos: nombre, WhatsApp, ciudad, rubros de interés, tu CV y, si la subís, tu foto de perfil. Las empresas cargan su RUC y datos de contacto.

2. Para qué los usamos: para conectar candidatos con empresas, mostrar tu perfil a las empresas donde te postulás y enviarte avisos sobre tus postulaciones.

3. Con quién los compartimos: solo con las empresas a las que te postulás, o que te encuentran si activaste "visible para empresas". No vendemos tus datos a terceros.

4. Tus derechos: podés ver, editar o eliminar tu cuenta y todos tus datos en cualquier momento desde tu perfil, conforme a la ley de protección de datos personales de Paraguay.

5. Seguridad: tu CV y tus documentos de identidad se guardan en almacenamiento privado y solo los ve quien corresponde.

Para ejercer tus derechos o hacer consultas, escribinos a los canales de contacto de la plataforma.`;

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  return (
    <LegalPage
      title="Política de privacidad"
      content={settings.legal_privacy ?? ""}
      fallback={FALLBACK}
    />
  );
}
