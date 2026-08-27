-- Worka Evaluar · Gestión de candidatos
--
-- Requiere la 025, 029, 030 y 031 aplicadas.

-- ── 1. Por qué se descartó ─────────────────────────────────────
--
-- Hoy el motivo vive en outcome_note, que es texto libre. Sirve para leerlo
-- de a uno y no sirve para nada más: no se puede contar, ni comparar entre
-- concursos, ni contestar "por qué se me cae la gente en la etapa 2".
--
-- El texto libre se queda igual y suma detalle; lo que se agrega es la
-- categoría, que es lo que se puede sumar.
alter table evaluar_participants
  add column if not exists reject_reason text;

create index if not exists idx_ev_participants_motivo
  on evaluar_participants (process_id, reject_reason)
  where reject_reason is not null;

-- ── 2. Qué se habló con el candidato ───────────────────────────
--
-- La comunicación se va por WhatsApp o por correo y no queda en ningún lado.
-- Cuando alguien del equipo pregunta "¿a este ya le avisamos?", la respuesta
-- está en el teléfono de otra persona.
--
-- No guarda el mensaje que mandó WhatsApp —eso no lo podemos saber— sino que
-- se abrió el contacto, con qué texto y quién lo hizo.
create table if not exists evaluar_contacts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null
    references evaluar_participants (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  channel text not null
    check (channel in ('whatsapp', 'email', 'llamada', 'otro')),
  subject text not null default '',
  body text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_ev_contacts_participant
  on evaluar_contacts (participant_id, created_at desc);

alter table evaluar_contacts enable row level security;

-- Misma regla que las notas: solo la empresa dueña del proceso.
drop policy if exists ev_contacts_company on evaluar_contacts;
create policy ev_contacts_company on evaluar_contacts
  for all using (
    exists (
      select 1
      from evaluar_participants pa
      join evaluar_processes p on p.id = pa.process_id
      where pa.id = evaluar_contacts.participant_id
        and (p.company_id = auth.uid() or fn_current_role() = 'admin')
    )
  )
  with check (
    exists (
      select 1
      from evaluar_participants pa
      join evaluar_processes p on p.id = pa.process_id
      where pa.id = evaluar_contacts.participant_id
        and (p.company_id = auth.uid() or fn_current_role() = 'admin')
    )
  );

-- ── 3. Encontrar a la misma persona en otros concursos ─────────
--
-- Para avisar "esta persona ya rindió para Cajero en marzo" hay que poder
-- buscarla por email dentro de los procesos de la misma empresa. Sin este
-- índice esa consulta recorre toda la tabla en cada ficha que se abre.
create index if not exists idx_ev_participants_email
  on evaluar_participants (lower(email))
  where email is not null;
