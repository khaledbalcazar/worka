-- ============================================================
-- Worka — Migración 041: contador de correos enviados
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================
--
-- El plan gratuito de Resend permite 100 correos por día y 3.000 por mes, y
-- ese cupo lo comparte TODO lo que manda Worka: la invitación a una
-- entrevista, el aviso de una postulación nueva, los recordatorios de
-- Evaluar y el resumen semanal de vacantes.
--
-- Sin un contador, el resumen semanal se come el cupo del día a las 10:05 y
-- a las 11:00 la invitación a una entrevista —que es la que de verdad no
-- puede fallar— se rechaza en silencio. Por eso se cuenta cada envío y el
-- resumen se reserva solo una parte del día.
--
-- Una fila por día, no una por correo: lo único que hace falta saber es
-- cuántos van, y una tabla con un registro por envío crece para siempre sin
-- que nadie la lea.

create table if not exists email_quota (
  dia date primary key,
  enviados integer not null default 0
);

alter table email_quota enable row level security;

-- Nadie la lee desde el navegador: la escribe el service role (que salta
-- RLS) y la lee el backoffice por la misma vía. Sin políticas, queda cerrada.

-- Suma uno al día de hoy y devuelve el total. Es atómica: si dos envíos
-- caen en el mismo milisegundo, un "leer y después escribir" desde el código
-- perdería uno de los dos y el contador quedaría por debajo del real, que es
-- justo el error que hace pasarse del cupo.
create or replace function public.fn_contar_email(p_dia date default current_date)
returns integer
language plpgsql security definer set search_path = public
as $$
declare
  total integer;
begin
  insert into email_quota (dia, enviados)
  values (p_dia, 1)
  on conflict (dia) do update set enviados = email_quota.enviados + 1
  returning enviados into total;
  return total;
end;
$$;

-- Cuánto se lleva enviado hoy y en el mes corriente.
create or replace function public.fn_cupo_email()
returns table (hoy integer, mes integer)
language sql stable security definer set search_path = public
as $$
  select
    coalesce((select enviados from email_quota where dia = current_date), 0),
    coalesce((select sum(enviados)::int from email_quota
              where dia >= date_trunc('month', current_date)::date), 0);
$$;
