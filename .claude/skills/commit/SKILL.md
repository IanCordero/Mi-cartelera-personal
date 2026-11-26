---
name: commit
description: Revisar y guardar cambios de este repositorio con mensajes en español y los sensores del curso. Usar cuando el estudiante invoque /commit.
disable-model-invocation: true
---

# Confirmar una unidad revisada

1. Leer AGENTS.md, la spec del cambio y git status. No abrir .env ni archivos privados.
2. Revisar git diff y git diff --cached. Seleccionar archivos explícitamente; nunca git add . sin revisar los nombres.
3. Comprobar que el documento de especificación tiene un commit anterior al código que implementa. Si falta, separar primero un commit docs: del documento.
4. Mostrar al estudiante el cambio concreto y la evidencia de verificación. Continuar solo después de su revisión; una revisión automatizada no cuenta como humana.
5. Ejecutar npm test y npx tsc --noEmit antes de cada commit de código. Conservar la suite original y los sensores. Si fallan, corregir antes de confirmar, salvo los commits rojos de Hitos 2/3 expresamente pedidos y documentados por el docente.
6. Usar uno de estos prefijos y una frase breve en español:
   - docs: documenta decisiones del resumen anual
   - feat: incorpora el resumen de mi año en cine
   - fix: conserva la fecha al editar un comentario
   - test: verifica desempates del resumen
   - chore: configura el formato automático
7. No añadir claves, .env, node_modules, dist o resultados humanos inventados. No usar --no-verify ni reescribir commits de P3.
8. Crear el commit con los archivos revisados y el mensaje acordado. Comprobar git show --stat y git status.
9. No hacer push ni publicar reglas como parte implícita de /commit. Informar lo que quedó confirmado y lo que sigue pendiente.
