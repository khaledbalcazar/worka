# Worka — Tu próximo paso

Plataforma de empleo 100% gratuita para Paraguay. Mobile-first para candidatos,
optimizada para escritorio del lado empresa.

**Stack:** Next.js (App Router) · Tailwind CSS · Supabase (PostgreSQL + Auth) · Vercel

## Modos de ejecución

- **Modo demostración** (por defecto): sin configurar nada, la app corre con
  datos de ejemplo. Ideal para ver la interfaz y los flujos.
- **Modo live**: con Supabase conectado, todo es real — auth, postulaciones,
  denuncias, moderación y RLS.

## Correr en local

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Conectar Supabase (modo live)

1. **Creá el proyecto**: entrá a [supabase.com](https://supabase.com), creá un
   proyecto nuevo (región recomendada: `sa-east-1`, São Paulo — la más cercana
   a Paraguay).

2. **Ejecutá el esquema**: en el Dashboard → SQL Editor, pegá y ejecutá el
   contenido de [`supabase/schema.sql`](supabase/schema.sql). Crea todas las
   tablas, triggers (moderación automática con 3 denuncias), políticas RLS y
   las vistas de BI.

3. **(Opcional) Datos de prueba**: ejecutá [`supabase/seed.sql`](supabase/seed.sql).
   Crea 3 cuentas de prueba (contraseña `worka2026`):
   - `empresa@demo.worka.py` — empresa verificada con 2 vacantes
   - `candidata@demo.worka.py` — candidata con una postulación
   - `admin@demo.worka.py` — acceso al backoffice `/admin`

4. **Variables de entorno**: copiá `.env.local.example` a `.env.local` y
   completá con los valores de Dashboard → Settings → API:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

5. **Google Auth (opcional)**: Dashboard → Authentication → Providers →
   Google. Necesitás un OAuth Client en Google Cloud Console con la redirect
   URI que te muestra Supabase. Sin esto, el ingreso por email/contraseña
   funciona igual.

6. **Storage para CVs (próximo paso)**: creá un bucket privado `cvs` y aplicá
   las políticas comentadas al final de `schema.sql`.

7. **Correo (opcional)**: sin `RESEND_API_KEY` no sale ningún correo y los
   avisos quedan solo dentro de la campanita. Con la clave puesta:

   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM=Worka <operaciones@worka.click>   # el dominio debe estar verificado en Resend
   ```

   El cupo del proveedor lo comparte **todo** lo que manda Worka (invitaciones
   a entrevistas, avisos de postulación, Evaluar y el resumen semanal de
   vacantes). Los valores por defecto son los del plan gratuito de Resend:

   | Variable | Por defecto | Para qué |
   |---|---|---|
   | `EMAIL_CAP_DIA` | `100` | Tope diario del plan |
   | `EMAIL_CAP_MES` | `3000` | Tope mensual del plan |
   | `EMAIL_RESERVA` | `30` | Envíos del día que el resumen semanal NO toca, para que una invitación a entrevista nunca choque contra el cupo |
   | `UNSUBSCRIBE_SECRET` | service role key | Firma los enlaces de baja. Conviene una propia: rotar la service key invalidaría los enlaces de correos ya enviados |

   Al pasar a un plan pago alcanza con subir `EMAIL_CAP_DIA` y `EMAIL_CAP_MES`
   en Vercel; no hay nada que cambiar en el código.

8. Reiniciá el dev server. La app detecta las variables y pasa a modo live.

## Deploy en Vercel

1. Subí el repo a GitHub e importalo en [vercel.com](https://vercel.com).
2. Agregá las dos variables de entorno en Project → Settings → Environment
   Variables.
3. Deploy. Listo.

## Estructura

```
app/
  (candidato)/       # Lado candidato (mobile-first): feed, detalle, postulaciones, perfil
  empresa/           # Lado empresa (desktop-first): panel, vacantes, kanban, perfil
  admin/             # Backoffice de moderación (rol admin)
  onboarding/        # Alta de candidato con parsing de CV
  actions.ts         # Server Actions (postular, denunciar, publicar, moderar…)
components/          # UI compartida
lib/
  data.ts            # Capa de datos (Supabase o mock según configuración)
  supabase/          # Clientes browser/server
  mock-data.ts       # Datos del modo demostración
supabase/
  schema.sql         # Esquema completo: tablas, triggers, RLS, vistas BI
  seed.sql           # Datos de prueba
```

## Pendientes para producción

- Subida real de CVs a Storage + parsing (Edge Function con `pdf-parse` o
  llamada a un modelo ligero).
- Webhook de WhatsApp (Meta Cloud API / Twilio) escuchando el cambio a
  'Revisado' en `applications` (campo `whatsapp_notified` ya previsto).
- Google Analytics 4 vía Tag Manager (eventos: `sign_up_completed`,
  `job_applied`, `cv_uploaded_pdf`, `job_reported`).
- Cron para expirar vacantes (`expires_at`) y calcular el sello
  "Responde rápido" (promedio de `reviewed_at - applied_at` < 72 h).
