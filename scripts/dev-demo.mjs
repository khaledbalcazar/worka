// Levanta Worka en "modo demostración": sin credenciales de Supabase la app
// cae en los datos de ejemplo. Sirve para revisar el diseño (sobre todo el de
// celular) sin tocar la base real y sin que el modo mantenimiento tape la
// vista. Next no pisa las variables que ya existen en process.env, así que
// dejarlas vacías acá alcanza para que .env.local no se aplique.
import { spawn } from "node:child_process";

const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
};

const port = process.env.PORT ?? "3100";

spawn("npx", ["next", "dev", "--port", port], {
  stdio: "inherit",
  env,
  shell: true,
});
