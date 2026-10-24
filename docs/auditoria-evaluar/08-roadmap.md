# Roadmap propuesto

## Ahora (esta semana)
1. Revisar y commitear los cambios de esta sesión (nada está commiteado).
2. Aplicar la **053** en staging, correr `supabase/tests/evaluar-053.sql` y los 9 pasos manuales de 05-correcciones. Después, aplicarla en producción.
3. Reparar las rutas de video perdidas (P-3), con un script revisado y en seco primero.
4. Decidir D-1 (edición de procesos publicados). Mientras tanto, la confirmación al borrar ya está.

## Próximas 2–4 semanas
5. EV-15: plan y rol de la exportación (D-5).
6. EV-20: clave `integridad_sjt` para plantillas nuevas (D-3).
7. EV-24: población del baremo y redondeo; mostrar `n` y la fecha.
8. EV-19: renombrar o implementar «opción múltiple».
9. Unificar los tableros (antecedente 5) y reorganizar Ajustes (antecedente 8, EV-35).
10. Glosario y barrido de terminología (D-6).
11. Accesibilidad del runner (EV-39): `role="radiogroup"`, foco visible, etiquetas en la escala y contraste medido.

## Trimestre
12. Apuesta I-3 (prueba en la vacante).
13. Apuesta I-2 (rúbricas), que también resuelve EV-37.
14. ~~Aleatorización y bancos (I-7)~~: hecho, en la 056 sin aplicar. Queda estratificar también por dificultad.
15. Analítica de ítems (I-5).

## Después
16. Apuesta I-1 (calibración con desempeño), con al menos 6 meses de datos limpios.
17. Señales de integridad durante la prueba (cambios de pestaña), siempre como señal y no como veredicto.

## Deuda técnica
- `app/evaluar/actions.ts` tiene unas 2.150 líneas y mezcla dominio, correo y permisos. Conviene separarlo en `procesos`, `candidato`, `decisiones`, `ia` y `admin`, y sacar los correos a `lib/evaluar/correos.ts`.
- Mover el resto de los cálculos puros (`qualityFlags`, `percentileOf`, `leerIntegridad`) a módulos sin imports de servidor para probarlos con `node --test`.
- Probar el SQL en CI con una base efímera (Supabase CLI o `pg` en Docker).
