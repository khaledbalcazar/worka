// Constantes de Worka Evaluar que también necesitan los componentes cliente.
//
// Van aparte de lib/evaluar.ts a propósito: ese módulo importa el cliente de
// Supabase del servidor (next/headers), así que importarlo desde un componente
// "use client" arrastra código de servidor al navegador y la compilación falla.
export const TRIAL_DAYS = 15;
