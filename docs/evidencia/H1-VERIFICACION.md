# Evidencia del Hito 1 · 25 de noviembre de 2026

Base: 94f278c. Rama local: epica-mi-anio. Etiqueta local: p3-final. Sin commits nuevos, sin push y sin lectura de .env.

| Comprobación                       | Resultado obtenido                                                       |
| ---------------------------------- | ------------------------------------------------------------------------ |
| npm ci --ignore-scripts            | Instalación original completada                                          |
| npm test antes del harness         | 11/11 pruebas originales aprobadas                                       |
| Instalación de herramientas        | Vitest 5.1.2 y Prettier 3.10.1, mediante expo install --dev y sin dotenv |
| npm test con harness               | 11/11 Vitest + 11/11 originales; 22 aprobadas                            |
| npx tsc --noEmit                   | Aprobado                                                                 |
| npm run lint                       | Aprobado                                                                 |
| git diff --check                   | Aprobado                                                                 |
| Hook con JSON PostToolUse/Write    | Convierte TypeScript sin formato al resultado esperado                   |
| Hook con una ruta privada ficticia | Descarta la ruta antes de abrirla; no crea ni lee un .env                |
| Inspección de nombres en historial | Ningún .env, .env.local ni .env.production rastreado                     |
| .env.example                       | Cero credenciales rellenadas; no se imprimieron valores                  |

Las pruebas del hook usan su script real con entrada representativa. No acreditan haber abierto /hooks o /context en Claude Code; esas comprobaciones están pendientes en el equipo del estudiante. No se ejecutó /commit porque la auditoría y el diff todavía necesitan su revisión humana.

Se corrigió una incompatibilidad de la revisión estática con la importación de Prettier mediante createRequire, sin desactivar ESLint. La configuración Vitest usa .mts para declarar ESM explícitamente, sin modificar el tipo de módulos de la app.

No se implementó código de la épica ni se declaró la entrega final como verificada. Las pruebas en teléfono, publicación de reglas y revisión del diseño siguen pendientes según el orden del enunciado.
