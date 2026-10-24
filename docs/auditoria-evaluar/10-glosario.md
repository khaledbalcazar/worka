# Glosario de Worka Evaluar

Decisión D-6. Se aplica a todo texto que lea una empresa o un candidato
(pantallas, correos, documentos y la landing). Los nombres internos del código
y de la base (`evaluar_processes`, `stage`, `participant`) no cambian.

| Término | Qué es | Quién lo lee | Ejemplo |
|---|---|---|---|
| **Proceso** | La búsqueda completa para un puesto: etapas, candidatos y decisión | Empresa | «Proceso de Cajero · Sucursal Centro» |
| **Etapa** | Cada parte del proceso, que se rinde de una vez | Empresa y candidato | «Etapa 2 de 3» |
| **Prueba** | El instrumento que mide algo; las del catálogo o una armada a mano | Empresa | «Prueba de razonamiento», «Las cinco pruebas del catálogo» |
| **Evaluación** | Lo que vive el candidato de punta a punta, con su enlace | Candidato | «Empezar mi evaluación», «Tu evaluación» |
| **Candidato** | La persona que rinde | Empresa | — |
| **Equipo** | Las personas que la empresa suma para mirar y anotar | Empresa | «Te sumaron a este proceso» |

## Reglas

- **«Concurso» no se usa** en Worka Evaluar. Queda reservado para cuando exista una opción de cuenta para el sector público; esa opción hoy no existe. Esta sesión reemplazó las 13 apariciones visibles (correo al equipo, acta de cierre, panel, editor y ajustes).
- **«Test»** solo en textos de marketing, donde el público lo busca así. Dentro del producto se dice «prueba».
- Las acciones de un candidato que se muestran a la empresa van en **tercera persona** («Ana completó la etapa»). Lo que se le muestra al candidato va en **segunda persona con voseo** («Completaste la etapa»).
- **Etiquetas de tipo de pregunta**: siempre las de `KIND_LABEL` (`lib/evaluar/puntaje.ts`), nunca el valor crudo.

## Pendiente

- Barrido de «test» / «prueba» dentro del producto. Hay mezcla en `TemplatePicker` («O un test suelto») y en el editor («Test ya armado»). No se tocó para no mezclar este cambio con el rediseño del catálogo (antecedente 10).
