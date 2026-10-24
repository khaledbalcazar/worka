// Levanta Worka en "modo demostración": sin credenciales de Supabase la app
// cae en los datos de ejemplo. Sirve para revisar el diseño (sobre todo el de
// celular) sin tocar la base real y sin que el modo mantenimiento tape la
// vista. Next no pisa las variables que ya existen en process.env, así que
// dejarlas vacías acá alcanza para que .env.local no se aplique.
import { spawn } from "node:child_process";

const port = process.env.PORT ?? "3100";

// El sitio apunta a sí mismo: si no, los enlaces que se arman con SITE_URL
// (por ejemplo «Continuar con Worka Empleos») saltarían a producción.
const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
  NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`,
};

spawn("npx", ["next", "dev", "--port", port], {
  stdio: "inherit",
  env,
  shell: true,
});
