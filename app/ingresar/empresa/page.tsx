import LoginScreen from "@/components/auth/LoginScreen";

export const metadata = { title: "Ingresar como empresa" };

// Ingreso de empresas. El alta no vive acá: registrar una empresa pide razón
// social y RUC, así que se deriva a /empresa/registro.
export default function IngresarEmpresaPage() {
  return <LoginScreen audience="empresa" product="worka" />;
}
