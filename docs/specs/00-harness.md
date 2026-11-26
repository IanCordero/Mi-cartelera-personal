# Spec H1 · Auditoría y harness

Estado: revisada y aprobada por el estudiante en la conversación del 25 de noviembre de 2026. Se autorizaron los cambios preparados del Hito 1 y continuar con PRD/diseño. Referencias: SPEC.md, docs/AUDITORIA.md y enunciado P4.

## Alcance y orden

1. Conservar el commit original 94f278c, tag p3-final y rama epica-mi-anio.
2. Escribir primero la referencia de P3, auditoría y esta spec.
3. Después preparar AGENTS.md, CLAUDE.md, skill local /commit, hook de Prettier y Vitest.
4. Ejecutar los sensores y presentar el diff al estudiante antes de cualquier commit nuevo.
5. Una vez revisado, commit docs: de estos documentos y luego commit chore:/test: de herramientas y sensores. No se inventa una aprobación ni se publican cambios sin verificar.

## Dependencias justificadas

- Vitest: dependencia de desarrollo exigida por el docente para los sensores de dominio. Se fija una versión compatible con Node y se conserva package-lock.json.
- Prettier: dependencia de desarrollo para el hook de formato exigido.
- Instalación mediante EXPO_NO_DOTENV=1 npx expo install --dev vitest prettier. No introduce módulos nativos ni requiere cambiar Expo SDK.
- Las 11 pruebas originales se conservan en test:legado. npm test ejecuta Vitest y esa suite, sin desactivar sensores.

## Contratos

- AGENTS.md describe app, capas, comandos y flujo docs → tests → implementación, prohíbe leer .env y usar any injustificados, y obliga a leer DESIGN.md antes de tocar UI. Mientras DESIGN.md no exista, no se implementan pantallas.
- CLAUDE.md contiene únicamente @AGENTS.md.
- .claude/skills/commit/SKILL.md usa prefijos docs:/feat:/fix:/test:/chore: y mensajes en español, revisa diff y exige revisión humana antes del commit. Es una skill de este repositorio para Claude Code; no se instala como skill personal de ChatGPT.
- .claude/settings.json configura PostToolUse para Edit/Write/MultiEdit; el comando Node formatea solo archivos dentro del proyecto y nunca .env, node_modules o .git.
- El script de formato se comprueba con una entrada JSON representativa. La activación real en /hooks y /context se verifica después en Claude Code del estudiante; no se acredita con la prueba del script.
- npm test y npx tsc --noEmit deben pasar antes de commits de código. La fase roja pedida expresamente en Hitos 2/3 se registrará como excepción puntual del enunciado, sin borrar ni desactivar tests.

## Primer sensor

Archivo tests/harness/regla-p3.test.ts. Casos: Vista admite 1 y 5; Por ver y Viendo rechazan estrellas; null es válido sin Vista; se rechazan 0, 6 y fracciones; comentario de 500 se admite y 501 se rechaza. Ejecuta la validación real de P3, no una copia de su implementación.

## Fuera de alcance de H1

Sin pantalla anual, campos nuevos, migraciones, cambio de reglas productivas ni rediseño de pantallas. No se marca H1 completo hasta que el estudiante revise la auditoría y se compruebe el harness disponible. No se guarda una clave ni se solicita pegarla en el chat.

## Puntos de proceso para resolver con el estudiante

El enunciado menciona Claude Code. Esta sesión usa Codex; los archivos de harness se prepararán para Claude Code y podrán comprobarse localmente con /context, /hooks y /commit. No se simula haber usado esas interfaces cuando no se ha ejecutado ese programa.
