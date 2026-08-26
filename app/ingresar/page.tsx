import { headers } from "next/headers";
import LoginScreen from "@/components/auth/LoginScreen";

export const metadata = { title: "Ingresar" };

// Ingreso de personas. En el subdominio de Evaluar la misma ruta muestra la
// versión de empresa con la marca de Evaluar: allá no hay candidatos que
// entren por su cuenta, entran con el enlace de su evaluación.
export default async function IngresarPage() {
  const host = (await headers()).get("host") ?? "";
  const esEvaluar = host.startsWith("evaluar.");

  return (
    <LoginScreen
      audience={esEvaluar ? "empresa" : "persona"}
      product={esEvaluar ? "evaluar" : "worka"}
    />
  );
}
