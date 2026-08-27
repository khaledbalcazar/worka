-- Worka Evaluar · El modelo de IA se elige, no viene fijo
--
-- Estaba escrito en el código y ya quedó obsoleto: Groq retira modelos con
-- bastante frecuencia y avisa poco. Con el nombre fijo, cada retiro deja el
-- asistente caído hasta que alguien despliegue un cambio, y el error que
-- devuelve la API no dice "modelo retirado" de forma evidente.
--
-- Va por clave y no global a propósito: así se puede probar un modelo nuevo
-- en una cuenta sin tocar la que está funcionando.
alter table evaluar_ai_keys
  add column if not exists model text not null default 'llama-3.3-70b-versatile';
