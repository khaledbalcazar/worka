# Pago con tarjeta: Lemon Squeezy

Integración del 24/10/2026. El código ya está: **mientras no cargues las
variables en Vercel, Worka se ve y cobra exactamente como antes** (link de pago
y aprobación manual). Cuando las cargues, aparece el botón «Pagar con tarjeta»
en cada producto.

## Decisiones

| Tema | Decisión |
|---|---|
| Precio | Sale de Worka: el que carga el admin en guaraníes. Se manda en cada checkout como `custom_price`, y Lemon Squeezy lo usa también en las renovaciones |
| Moneda | Dólares. El precio en guaraníes se convierte con el tipo de cambio del admin (`fx_usd_pyg`, en «Pagos y planes») y se redondea a dólares enteros |
| Cobro | Suscripción que se renueva sola: mensual, trimestral o anual. El anual cuesta 10 meses |
| WORKA3PRO | Sigue dentro de Worka, sin pasar por Lemon Squeezy |
| Cobro manual | Sigue al lado, para transferencias, Bancard y quien no tiene tarjeta internacional |

**Ojo con el precio en el panel de Lemon Squeezy:** el que pongas en cada
variante no se usa, porque manda `custom_price`. Poné uno cualquiera, por
ejemplo 1 USD.

**Si el admin cambia un precio:** vale para las compras nuevas. Las
suscripciones ya activas siguen renovando al precio con que se compraron. Así
funciona `custom_price` en Lemon Squeezy.

## Paso a paso

### 1. Tienda
- Activá la tienda en Lemon Squeezy, con tu identidad verificada y la cuenta de cobro cargada.
- En **Settings → General**, poné la moneda de la tienda en **USD**.
- Anotá el **Store ID**: Settings → Stores, es el número.

### 2. Productos y variantes (18)
Creá cuatro productos con estas variantes. Los nombres son sugerencias; el
**intervalo** sí tiene que ser ese.

| Clave | Producto / variante | Tipo e intervalo |
|---|---|---|
| `enterprise:pro:1` | Worka Enterprise Pro · Pro mensual | Suscripción, cada 1 mes |
| `enterprise:pro:3` | Worka Enterprise Pro · Pro trimestral | Suscripción, cada 3 meses |
| `enterprise:pro:12` | Worka Enterprise Pro · Pro anual | Suscripción, cada 1 año |
| `enterprise:empresa:1` | Worka Enterprise Pro · Empresa mensual | Suscripción, cada 1 mes |
| `enterprise:empresa:3` | Worka Enterprise Pro · Empresa trimestral | Suscripción, cada 3 meses |
| `enterprise:empresa:12` | Worka Enterprise Pro · Empresa anual | Suscripción, cada 1 año |
| `pro:pro:1` | Worka Pro mensual | Suscripción, cada 1 mes |
| `pro:pro:3` | Worka Pro trimestral | Suscripción, cada 3 meses |
| `pro:pro:12` | Worka Pro anual | Suscripción, cada 1 año |
| `evaluar:esencial:1` | Worka Evaluar · Esencial mensual | Suscripción, cada 1 mes |
| `evaluar:esencial:3` | Worka Evaluar · Esencial trimestral | Suscripción, cada 3 meses |
| `evaluar:esencial:12` | Worka Evaluar · Esencial anual | Suscripción, cada 1 año |
| `evaluar:profesional:1` | Worka Evaluar · Profesional mensual | Suscripción, cada 1 mes |
| `evaluar:profesional:3` | Worka Evaluar · Profesional trimestral | Suscripción, cada 3 meses |
| `evaluar:profesional:12` | Worka Evaluar · Profesional anual | Suscripción, cada 1 año |
| `boost:7` | Vacante destacada · 7 días | Pago único |
| `boost:15` | Vacante destacada · 15 días | Pago único |
| `boost:30` | Vacante destacada · 30 días | Pago único |

Sin prueba gratuita en las variantes: Evaluar ya tiene la suya dentro de Worka.
Si a una clave le falta la variante, ese botón simplemente no aparece y el resto
funciona.

### 3. Webhook
En **Settings → Webhooks → +**:
- **URL:** `https://worka.click/api/webhooks/lemonsqueezy`
- **Secreto:** una cadena larga al azar (de 6 a 40 caracteres). La misma va a Vercel.
- **Eventos:** `order_created`, `order_refunded`, `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_resumed`, `subscription_expired`, `subscription_paused`, `subscription_unpaused`, `subscription_payment_success`, `subscription_payment_failed`, `subscription_payment_recovered`.

### 4. Variables en Vercel
Environment Variables. No las pegues en el chat ni en el código.

```
LEMONSQUEEZY_API_KEY=…            (Settings → API; primero una de modo prueba)
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=…     (el del paso 3)
LEMONSQUEEZY_TEST_MODE=1          (mientras probás; sacala al pasar a real)
LEMONSQUEEZY_VARIANTS={"enterprise:pro:1":111111,"enterprise:pro:3":111112, … ,"boost:30":111129}
```

`LEMONSQUEEZY_VARIANTS` es un JSON en una sola línea, con cada clave de la
tabla y el **ID de su variante**: en el panel, Products → la variante → el
número de la URL.

También hace falta `SUPABASE_SERVICE_ROLE_KEY`, que ya está: el webhook escribe
sin sesión.

### 5. Base de datos
Correr `supabase/migration-057.sql`. Crea `billing_subscriptions` y
`billing_events`, y agrega `boost_requests.provider_order_id`.

### 6. Probar en modo prueba (staging o producción con `LEMONSQUEEZY_TEST_MODE=1`)
1. Empresa de prueba → `/empresa/planes` → elegí Pro mensual → «Pagar con tarjeta» → pagá con la tarjeta de prueba de Lemon Squeezy (`4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC).
2. Al volver: el aviso «Recibimos tu pago», y en segundos el plan Pro activo, la campanita y el correo.
3. En Supabase, `select event_name, processed_at, error from billing_events order by created_at desc;` → los eventos con `processed_at` y sin error.
4. «Gestionar suscripción» → abre el portal de Lemon Squeezy → cancelá → el plan sigue hasta la fecha de fin y el botón pasa a decir «Cancelada».
5. Lo mismo con Worka Pro (`/pro`) y Evaluar (`/evaluar/app/plan`).
6. Destacado: `/empresa` → «Potenciar» → «7 días · pagar con tarjeta» → la vacante queda destacada.
7. En el panel de Lemon Squeezy, reenviá un webhook ya procesado → `billing_events` no duplica y el plan no se extiende de más.

### 7. Pasar a real
Cambiá `LEMONSQUEEZY_API_KEY` por la clave real, sacá `LEMONSQUEEZY_TEST_MODE`,
creá el webhook también en modo real (en Lemon Squeezy los de prueba y los
reales son distintos) y repetí una compra real chica.

## Cómo funciona

```
Botón → startCardCheckout (servidor)
        valida plan y permisos, calcula el precio en USD,
        crea el checkout con checkout_data.custom = {payer_id, buyer_id, product, plan, months, boost_id}
     → checkout de Lemon Squeezy (plan ya elegido) → pago
     → webhook firmado → /api/webhooks/lemonsqueezy
        1. firma HMAC-SHA256 (X-Signature) o 401
        2. billing_events: si ya se procesó, 200 sin hacer nada
        3. activa, extiende o corta:
           Enterprise / Pro → subscriptions
           Evaluar          → evaluar_accounts (status activa, paid_until)
           Destacado        → boost_requests activo + jobs.featured_until
```

| Estado en Lemon Squeezy | Acceso en Worka |
|---|---|
| `active`, `on_trial` | Hasta la próxima renovación |
| `past_due` (falló el cobro y reintenta) | Se mantiene hasta la renovación original y se avisa para cambiar la tarjeta |
| `cancelled` | Hasta que termina lo pagado |
| `paused`, `unpaid`, `expired` | Se corta, pero solo lo que dio esa suscripción: los días de una promoción o de un pago manual no se tocan |

**Reglas de seguridad:**
- El plan, la duración y el precio los calcula el servidor; del navegador solo llega qué eligió la persona.
- Quién pagó sale de los datos ocultos del checkout, que vuelven en el webhook firmado, nunca de la URL de vuelta.
- Una compra hecha desde la página pública de la tienda, sin esos datos, se registra pero no activa nada.
- Una sola suscripción con tarjeta por producto, para no cobrar dos veces.

## Archivos

| Archivo | Qué hace |
|---|---|
| `lib/billing/catalogo.ts` | Reglas puras: compras válidas, claves de variante, guaraníes → USD, datos ocultos, acceso por estado (9 pruebas: `npm run test:billing`) |
| `lib/billing/firma.ts` | Verificación de la firma y clave del evento |
| `lib/billing/lemonsqueezy.ts` | Cliente de la API: crear checkout y leer una suscripción |
| `lib/billing/ofertas.ts` | Precio en USD y disponibilidad para las pantallas |
| `lib/billing/activar.ts` | Qué hace Worka con cada evento |
| `app/billing-actions.ts` | `startCardCheckout` y `openBillingPortal` |
| `app/api/webhooks/lemonsqueezy/route.ts` | El webhook |
| `components/plans/CardCheckout.tsx` | «Pagar con tarjeta» y «Gestionar suscripción» |
| `components/evaluar/EvaluarPlanCheckout.tsx`, `app/evaluar/app/plan/page.tsx` | Mi plan de Evaluar |
| `supabase/migration-057.sql` | Tablas nuevas |

## Pendientes y límites conocidos

- **Sin probar contra Lemon Squeezy:** todavía no hay cuenta ni claves. Lo verificado: tsc, eslint, 9 pruebas unitarias (firma, precios, estados, datos ocultos), que las pantallas cargan en modo demo y que el webhook sin configurar responde 503.
- **Cambio de plan:** por ahora, se cancela la suscripción y se contrata la otra; el botón avisa si ya hay una activa. Si se habilita el cambio desde el portal de Lemon Squeezy, se aplica el precio de la variante nueva (no `custom_price`) y Worka no se entera del plan nuevo. Conviene dejarlo deshabilitado en el portal.
- **Reembolsos de suscripciones:** Lemon Squeezy los refleja como cambios de estado de la suscripción, y Worka sigue ese estado. El reembolso de un destacado lo desactiva.
- **Factura legal:** Lemon Squeezy manda su recibo como vendedor, pero no emite factura paraguaya con RUC. El recibo digital de Worka tampoco se emite para estos pagos. Revisar con el contador.
- **Medios de pago:** tarjeta internacional, PayPal, Apple Pay y Google Pay. Bancard y transferencias siguen por el cobro manual.
- **Redondeo:** a dólares enteros. Si querés precios terminados en ,99 o fijos en dólares, se agrega una clave de precio en USD por plan.
- **Backoffice:** no hay pantalla para ver `billing_events` y `billing_subscriptions`; por ahora, desde Supabase.
