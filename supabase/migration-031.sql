-- Worka Evaluar · Que un plan mal escrito no degrade una cuenta en silencio
--
-- Contexto: el plan se puede tocar por SQL directo, y el código sólo entiende
-- tres valores. Cualquier otro cae a 'esencial' sin decir nada: la empresa
-- pierde el informe por candidato, el asistente y el equipo, y no hay ningún
-- error en ningún lado que explique por qué. Pasó con un UPDATE que dejó el
-- texto de ejemplo ('nuevo_nombre_del_plan') como valor real.
--
-- La corrección es que la base rechace el valor invalido en el momento, en
-- lugar de aceptarlo y degradar la cuenta después.

-- ── 1. Ver qué hay hoy ─────────────────────────────────────────
-- Cualquier fila que no sea uno de los tres planes está degradada.
select
  plan,
  count(*) as cuentas,
  case
    when plan in ('esencial', 'profesional', 'corporativo') then 'ok'
    else 'INVALIDO: esta cuenta esta funcionando como esencial'
  end as estado
from evaluar_accounts
group by plan
order by cuentas desc;

-- ── 2. Enderezar lo que quedó mal ──────────────────────────────
-- Se llevan a 'esencial' porque es lo que ya venían siendo en la práctica:
-- así el valor guardado coincide con el comportamiento real, y desde el
-- backoffice se les puede asignar el plan que corresponda.
update evaluar_accounts
set plan = 'esencial'
where plan not in ('esencial', 'profesional', 'corporativo');

-- ── 3. El candado ──────────────────────────────────────────────
-- A partir de acá, un UPDATE con un plan que no existe falla con un error
-- claro en vez de dejar la cuenta degradada sin aviso.
alter table evaluar_accounts drop constraint if exists evaluar_accounts_plan_check;
alter table evaluar_accounts add constraint evaluar_accounts_plan_check
  check (plan in ('esencial', 'profesional', 'corporativo'));

-- ── 4. Darte el plan Profesional a vos ─────────────────────────
-- Reemplazá el UUID por el de tu empresa si es otro.
update evaluar_accounts
set plan = 'profesional'
where company_id = 'b3f5d06d-91f5-4225-987d-338537aae768';

-- ── 5. Comprobar ───────────────────────────────────────────────
select company_id, plan, status, trial_ends_at, paid_until
from evaluar_accounts
order by created_at desc;
