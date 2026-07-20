import { getSiteSettings } from "@/lib/data";
import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Términos y condiciones" };
export const revalidate = 300;

const FALLBACK = `Al usar Worka aceptás estos términos.

1. Worka es una plataforma que conecta a personas que buscan empleo con empresas que publican vacantes en Paraguay. El uso para candidatos es gratuito.

2. Las empresas son responsables de la veracidad de sus vacantes. Worka verifica el RUC de cada empresa, pero no garantiza la contratación ni las condiciones de cada oferta.

3. Está prohibido publicar ofertas que pidan dinero al candidato, datos bancarios o información falsa. Estas se eliminan y la cuenta puede ser suspendida.

4. Los datos personales se tratan conforme a nuestra Política de Privacidad y a la ley de protección de datos personales de Paraguay.

5. Worka puede modificar o suspender el servicio y actualizar estos términos. El uso continuado implica la aceptación de los cambios.

Para consultas, escribinos a los canales de contacto de la plataforma.`;

export default async function TermsPage() {
  const settings = await getSiteSettings();
  return (
    <LegalPage
      title="Términos y condiciones"
      content={settings.legal_terms ?? ""}
      fallback={FALLBACK}
    />
  );
}
