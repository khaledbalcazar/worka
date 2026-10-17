-- Migración 049: código promocional en las suscripciones.
--
-- La promoción de lanzamiento (WORKA3PRO) activa Worka Enterprise Pro · Pro
-- por 3 meses a las empresas nuevas. El código queda guardado en la
-- suscripción para mostrarlo en /empresa/planes y en el admin, y el índice
-- único impide canjear dos veces el mismo código con la misma empresa.

alter table subscriptions add column if not exists promo_code text;

create unique index if not exists uq_subscriptions_promo
  on subscriptions (user_id, promo_code)
  where promo_code is not null;
