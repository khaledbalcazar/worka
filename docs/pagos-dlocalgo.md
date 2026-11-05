# Pagos con tarjeta vía dLocal Go

Desde el 04/11/2026 el cobro con tarjeta de Worka Enterprise Pro, Worka Pro,
Worka Evaluar y los destacados va por [dLocal Go](https://docs.dlocalgo.com/integration-api).
Reemplaza a Lemon Squeezy (ver «Lo heredado de Lemon Squeezy» al final).
Sin las variables cargadas, todo queda como antes: solo el cobro manual.

## Cómo funciona

1. La persona elige plan y duración (1, 3 o 12 meses) y aprieta «Pagar con
   tarjeta». El servidor valida la compra, calcula el precio con la lista del
   admin, guarda la compra en `billing_payments` y crea el pago en dLocal Go
   (`POST /v1/payments`) con nuestro id como `order_id`.
2. La persona paga en el checkout de dLocal Go y vuelve a Worka:
   - pagó → `success_url` = `…?pago=ok&ref=<id>`;
   - abandonó → `back_url` = `…?pago=cancelado`.
3. El plan se activa por cualquiera de estos tres caminos, y solo una vez:
   - el aviso de dLocal Go a `/api/webhooks/dlocalgo` (lo normal, segundos);
   - la página de retorno, que pregunta el estado al volver;
   - el cron diario `/api/cron/pagos`, que revisa los pagos de los últimos
     tres días que quedaron sin activar.
   Los tres le preguntan el estado a la API (`GET /v1/payments/{id}`) y
   exigen `PAID`, nuestro `order_id`, la misma moneda y el monto entero.

### Lo que cambia frente a Lemon Squeezy

- **No hay renovación automática.** Las suscripciones de dLocal Go son
  planes de monto fijo creados de antemano, y su aviso solo trae el
  `payment_id`: no hay forma segura de saber a quién activar una renovación
  ni de cobrar el precio que fija el admin. Cada pago cubre un período. Si
  se paga de nuevo antes de que venza, los días se suman. Pendiente: un
  aviso de «tu plan vence en N días» con el botón de renovar.
  Si más adelante hace falta que se renueve solo, dLocal Go tiene «recurring
  payments» (`allow_recurring` y `POST /v1/payments/recurring/{token}`):
  cobros iniciados por Worka con la tarjeta guardada, por el monto que
  queramos. Requiere un cron de cobro y la gestión de rechazos.
- **Se cobra en guaraníes** por defecto (`DLOCALGO_CURRENCY=USD` vuelve a
  dólares enteros con el cambio del admin).
- **No hay portal del cliente**: no hay tarjeta guardada que cambiar ni
  suscripción que cancelar.

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Valor |
|---|---|
| `DLOCALGO_API_KEY` | API Key (panel → Integraciones → Integración API) |
| `DLOCALGO_SECRET_KEY` | Secret Key, la misma pantalla |
| `DLOCALGO_SANDBOX` | `1` mientras se prueba con las claves de sandbox; borrarla en producción |
| `DLOCALGO_CURRENCY` | opcional: `PYG` (por defecto) o `USD` |
| `DLOCALGO_COUNTRY` | opcional: `PY` por defecto; vacía, el checkout le pregunta el país a la persona |

Las claves de sandbox salen de https://dashboard-sbx.dlocalgo.com y las reales
de https://dashboard.dlocalgo.com: son distintas. Nunca van en el código ni
llegan al navegador; solo las lee el servidor.

También hacen falta las que ya existen: `NEXT_PUBLIC_SITE_URL` (arma las URLs
de retorno y del aviso), `SUPABASE_SERVICE_ROLE_KEY` y `CRON_SECRET`.

## Qué configurar en el panel de dLocal Go

Nada por pago: Worka manda las tres URLs en cada pago.

- **URL del aviso (notification_url):** `https://worka.click/api/webhooks/dlocalgo`
- **URLs de retorno (success_url / back_url):**
  - Enterprise Pro: `https://worka.click/empresa/planes?pago=ok&ref=…` / `?pago=cancelado`
  - Worka Pro: `https://worka.click/pro?…`
  - Evaluar: `https://evaluar.worka.click/app/plan?…`
  - Destacados: `https://worka.click/empresa?…`

En el panel conviene:
- revisar que los medios de pago (tarjeta de crédito y débito) estén
  habilitados para Paraguay y que la moneda PYG esté aceptada (si no, usar
  `DLOCALGO_CURRENCY=USD`);
- si el panel tiene un campo de URL de notificaciones por defecto, poner la
  misma de arriba (no hace falta, pero no estorba).

## Probar en sandbox

1. Cargar las claves de sandbox y `DLOCALGO_SANDBOX=1` solo en el entorno
   Preview de Vercel, y hacer un deploy nuevo (las variables no cambian los
   deploys ya hechos). En Preview, el retorno y el aviso vuelven a ese mismo
   deploy, no a worka.click. Si el proyecto tiene Deployment Protection,
   activar «Protection Bypass for Automation» (Settings → Deployment
   Protection): Worka le agrega ese secreto a la URL del aviso. En localhost
   solo funciona la confirmación al volver.
2. Correr la migración `supabase/migration-058.sql`.
3. Pagar un plan con la tarjeta de prueba `4111 1111 1111 1111` (cualquier
   vencimiento futuro, cualquier CVV). Rechazada: `5555 5555 5555 4444`.
4. Revisar `billing_payments` (estado `PAID` y `activated_at`),
   `billing_events` (el aviso) y el plan activo en la pantalla.

## Lo heredado de Lemon Squeezy

Ya no se crean checkouts de Lemon Squeezy. Lo que queda (`lib/billing/lemonsqueezy.ts`,
`lib/billing/activar.ts`, `/api/webhooks/lemonsqueezy` y «Gestionar
suscripción») sirve solo a las suscripciones contratadas antes, que Lemon
Squeezy sigue renovando hasta que se cancelen. Mientras una siga activa, a esa
cuenta no se le ofrece pagar con dLocal Go (cobraría dos veces).

Para cerrarlo del todo: cancelar las suscripciones activas desde el panel de
Lemon Squeezy (siguen hasta el fin del período pagado), esperar a que
venzan, borrar las variables `LEMONSQUEEZY_*` de Vercel y después ese código.
Las tablas `billing_subscriptions` y `billing_events` quedan como historial.
