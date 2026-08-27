-- Worka Evaluar · El evaluador tiene que poder leer el ciclo
--
-- Requiere la 033 y la 036 aplicadas.
--
-- Síntoma: el jefe abre el enlace de una evaluación que le tocó y le sale un
-- 404, aunque la fila exista y sea suya.
--
-- Causa: la pantalla trae la evaluación junto con su ciclo, porque necesita
-- el título y qué competencias se evalúan. La fila la ve —tiene su política—
-- pero el ciclo no: evaluar_ciclos solo dejaba leer al dueño de la cuenta.
-- El join volvía nulo y la página lo trataba como "no existe".
--
-- ── Por qué con una función y no con un exists directo ────────
--
-- La política de evaluar_desempeno ya consulta evaluar_ciclos. Si la de
-- evaluar_ciclos consultara evaluar_desempeno, quedarían mirándose entre sí y
-- Postgres corta con "infinite recursion detected in policy". Una función
-- security definer lee sin pasar por RLS y rompe ese círculo.

create or replace function fn_participa_en_ciclo(p_ciclo uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from evaluar_desempeno d
    where d.ciclo_id = p_ciclo
      and (
        -- Le toca evaluar, ya enlazado o esperando por email.
        d.evaluador_id = auth.uid()
        or (
          d.evaluador_id is null
          and d.evaluador_email <> ''
          and lower(d.evaluador_email) = lower(coalesce(auth.email(), ''))
        )
        -- O es la persona evaluada, y solo cuando ya se la enviaron: antes de
        -- eso ni siquiera tiene por qué saber que el ciclo existe.
        or (d.empleado_id = auth.uid() and d.status = 'enviada')
      )
  );
$$;

grant execute on function fn_participa_en_ciclo(uuid) to authenticated;

-- Lectura del ciclo para quien participa. La política de la empresa dueña
-- sigue intacta y es la única que permite escribir: acá solo se lee.
drop policy if exists ev_ciclos_participa on evaluar_ciclos;
create policy ev_ciclos_participa on evaluar_ciclos
  for select using (fn_participa_en_ciclo(id));
