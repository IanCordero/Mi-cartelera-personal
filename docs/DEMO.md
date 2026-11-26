# Demo de cinco minutos

Ensayo en Expo Go pendiente de Ian. Preparar antes la cuenta propia, reglas revisadas/publicadas y datos de prueba; no mostrar .env. Tener un año con datos y el actual vacío. El selector solo muestra años con obras más el actual: para el paso vacío se usa el actual, sin añadir años artificiales.

| Tiempo    | Acción                                                      | Explicación                                                                                                                                                   |
| --------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:45 | Abrir docs/diseno/brand-board.html y la maqueta             | Lavanda identifica acciones; menta destaca el mes más activo; los textos tienen contraste ≥4,5:1. Mostrar que los mismos valores viven en src/tema/tokens.ts  |
| 0:45–1:30 | git log --oneline --reverse p3-final..epica-mi-anio         | Señalar docs antes de código y el commit test rojo antes de implementar dominio. No afirmar que cambios sin commit ya están en GitHub                         |
| 1:30–2:30 | Marcar una obra Por ver → Vista y abrir Mi año              | Fecha del servidor, total +1, película suma duración y serie no; editar comentario no cambia vistaEn                                                          |
| 2:30–3:00 | Elegir el año actual vacío preparado previamente            | Mensaje y botón Ir a Mi lista. Si acaba de marcar Vista en el actual, quitar ese estado o usar otra cuenta de demo ya preparada; nunca falsificar el selector |
| 3:00–4:00 | Introducir temporalmente un color fijo y ejecutar el sensor | Mostrar que falla con archivo y línea; restaurar exactamente el cambio y volver a verde. No confirmar el cambio roto                                          |
| 4:00–5:00 | Explicar D8 y un empate                                     | PRD D8 → backlog CA-11 → test de medias/calificación/alfa → preferida. El desempate usa calificación personal, no TMDB                                        |

## Experimento controlado del sensor

Con el árbol limpio o guardando aparte los cambios propios, añadir una línea temporal a una pantalla con un color hexadecimal. Ejecutar `npx vitest run src/tema/coloresFijos.test.ts`. Borrar exclusivamente la línea que se acaba de añadir y repetir. No usar git restore sobre trabajo pendiente de otras personas, no saltar tests y no hacer commit en rojo fuera de los hitos expresamente previstos.

## Comprobación previa

Ejecutar npm test, npx tsc --noEmit y npm run lint. Abrir Expo Go y comprobar inicio persistente, nueva pestaña, cambio de año y modo avión. Revisar docs/VERIFICACION.md y completar los resultados reales. En Claude Code comprobar /context, /hooks y la skill /commit; su presencia en archivos no demuestra que se hayan ejecutado.
