import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // react-pdf trae su propio motor de fuentes y layout: se usa tal cual desde
  // node_modules en vez de empaquetarlo.
  serverExternalPackages: ["@react-pdf/renderer"],
  // Las fuentes del informe PDF se leen del disco: hay que llevarlas a la
  // función del servidor junto con la ruta que las usa.
  outputFileTracingIncludes: {
    "/evaluar/app/procesos/**": ["./lib/evaluar/pdf/fonts/**/*"],
  },
};

export default nextConfig;
