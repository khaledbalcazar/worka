-- ============================================================
-- Worka — Fix: no se podia postular en produccion
-- Causa: la politica RLS de insert en applications exigia
--        candidates.phone_verified = true. Como la verificacion por WhatsApp
--        todavia usa codigo de prueba (falta conectar la API de Meta), esa
--        regla bloqueaba postulaciones legitimas con error 42501.
-- Solucion: el insert solo exige que la postulacion sea del propio candidato.
-- El anti-spam (perfil completo + limite diario) queda a nivel de la app.
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================

drop policy if exists applications_candidate_insert on applications;
create policy applications_candidate_insert on applications
  for insert with check (candidate_id = auth.uid());
