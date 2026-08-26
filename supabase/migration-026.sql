-- ============================================================
-- Worka — Migración 026: archivar procesos, perfil ideal y menciones
--
-- - archived: los procesos viejos ensucian el panel y no hay forma de
--   sacarlos sin borrarlos (y borrarlos se lleva las evaluaciones).
-- - ideal_profile: qué rasgos importan para ESE puesto y con qué peso. Sin
--   esto, el ranking ordena por puntaje bruto, que trata igual a un cajero y
--   a un supervisor.
-- - mention_user_id: pedirle una segunda opinión a alguien del equipo sobre
--   un candidato concreto.
-- - trial_warned_at: para avisar una sola vez que la prueba está por vencer.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

alter table evaluar_processes
  add column if not exists archived boolean not null default false,
  -- { "teson": 3, "cliente": 2 }  ·  peso 1 a 3
  add column if not exists ideal_profile jsonb not null default '{}'::jsonb;

create index if not exists idx_ev_processes_archived
  on evaluar_processes (company_id, archived, status);

alter table evaluar_notes
  add column if not exists mention_user_id uuid references profiles (id) on delete set null;

alter table evaluar_accounts
  add column if not exists trial_warned_at timestamptz;

-- Marca de qué se le avisó ya a la empresa sobre cada candidato, para no
-- mandar el mismo correo dos veces si se recalcula algo.
alter table evaluar_participants
  add column if not exists company_notified_at timestamptz;
