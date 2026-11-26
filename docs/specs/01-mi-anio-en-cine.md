# Spec 01 · Mi año en cine

Estado: preparada a partir del PRD, backlog y diseño revisados. Ticket paraguas: T-06. Este documento y los tests se guardan antes de implementar dominio/datos/interfaz. No se atribuye al docente la resolución de los puntos abiertos del PRD.

## Alcance y fuera de alcance

Implementar HU-A.1–HU-A.5 y D1–D13 manteniendo RF1–RF10. Pestaña anual, metadatos, fecha, migración, resumen, selector y mensajes. No hay revisionados, edición manual de fecha, gráficas externas, nueva colección pública ni cambio del SDK. No leer .env, no publicar reglas sin el proyecto/autorización del estudiante y no inventar resultados en teléfono.

## Modelo de datos y compatibilidad

ItemLista conserva sus campos. Suma opcionalmente vistaEn: string|null en memoria (Timestamp|null en Firestore), generos: string[], duracionMin: number|null y directores: string[]. Ausente significa documento anterior que necesita preparación; vacío/null significa que TMDB respondió pero no tiene ese dato. Nunca descartar un documento válido de P3 por no tener campos nuevos.

Las altas nuevas incluyen los cuatro campos y estado Por ver/vistaEn null. Los cambios de campos personales conservan identidad y metadatos. La clave AsyncStorage por uid se mantiene para leer copias anteriores sin perderlas. El lector valida campos nuevos solo cuando están presentes. No se agrega un marcador oculto ni una quinta propiedad al esquema de Firestore.

## Dominio puro: contratos y decisiones técnicas

Archivos src/dominio/resumenAnual.ts, visionado.ts y metadatos.ts, sin importar Firebase, React, almacenamiento o servicios. No leer el reloj: las fechas actuales/año/zona llegan desde fuera.

- resumenAnual(items, anio, zonaHoraria): ResumenAnual. Se añade zona explícita a la firma sugerida para que el resultado sea puro y se pruebe D3 sin depender de la zona de la máquina que ejecuta tests.
- aniosDisponibles(items, anioActual, zonaHoraria): number[]. Incluir el actual aunque esté vacío; orden descendente; sin duplicados.
- Solo cuentan estado Vista y vistaEn válido. Deduplicar por itemId (primera entrada), no por tmdbId, que puede repetirse entre película/serie.
- Parsear una fecha recibida (new Date(iso)) es válido; crear una fecha actual (new Date() sin argumentos o Date.now) no lo es. Obtener año/mes con Intl.DateTimeFormat y zona recibida; los timestamps se comparan por su valor absoluto.
- La suma de minutos incluye películas con metadatos completos y duración válida; redondear el resultado a un decimal. peliculasSinDuracion cuenta películas sin duración válida, aunque coincidan con obrasSinDatos; los avisos explican que pueden solaparse.
- Datos incompletos: falta cualquiera de generos/duracionMin/directores o incumple su contrato. La obra sigue en totales, meses y destacada, pero no suma horas/género/director. Arrays vacíos y duración null son datos completos si sus campos existen y son válidos.
- Géneros/directores se cuentan una vez por nombre y por obra. Empates: cantidad, promedio de puntuaciones personales válidas (sin calificadas pierde) y nombre alfabético español. No usar puntuación TMDB como sustituto.
- Mes top: más obras; empate mayor índice (más reciente). Si total es cero, mesTop null y doce ceros.
- Destacada: puntuación personal válida mayor, fecha absoluta más reciente; si empatan ambas, itemId estable como propuesta técnica PA-02 ya presentada al estudiante, no como nueva regla del docente.
- planificarTransicion(item, cambios) valida la regla P3 y devuelve cambios personales + intención de fecha: servidor / conservar / borrar. Solo la capa de servicios traduce servidor a serverTimestamp.
- fechaParaMigrar(item) devuelve el actualizadoEn recibido solo para Vista sin fecha; nunca lee el reloj. En documentos con fecha no hace nada.
- normalizarMetadatos(tipo, entrada) depura strings, recorta listas únicas a diez y convierte duración inválida/ausente en null; series fuerzan null y []. Duración válida es entera, mayor que cero y hasta 1000.
- planificarPreparacion(items, anio, zonaHoraria, conectado) devuelve pendientes de fechas (todos los años) y metadatos (solo año elegido). Offline devuelve ambas listas vacías. Al migrar fechas se vuelve a calcular el plan de metadatos.

## Servicios, estado y preparación

1. tmdbService amplía credits con crew y obtiene directores con job Director. Mantiene append_to_response=credits, es-ES y una petición de detalle. Las altas desde fichas llevan sus metadatos; el servicio también puede recuperar un detalle si recibe una Obra básica.
2. listaService actualiza estado dentro de transacción con el documento actual. Si entra a Vista, vistaEn serverTimestamp; si sale, null; si sigue Vista, no cambia el campo. La modificación de estrellas/comentario mantiene vistaEn.
3. migrarFecha(uid,id) lee el documento actual en transacción y copia su actualizadoEn anterior solo si sigue Vista y sin fecha. No pisa cambios personales ni reescribe una fecha existente.
4. completarMetadatos(uid,id,datos,anio,zona) vuelve a leer el documento y escribe solo si sigue Vista, en el año elegido y todavía incompleto. Si ya está completo o cambió su estado/año, no reemplaza nada. ActualizadoEn serverTimestamp en cada mutación; agregadoEn se conserva.
5. preparacionService coordina operaciones secuenciales mediante dependencias inyectadas: leer lista actual, migrar, pedir TMDB, guardar, aplicar confirmado y notificar progreso. No paralelizar peticiones por obra. Continuar ante fallos individuales, registrar ids fallidos y ofrecer reintento. Las fechas preceden a metadatos para no usar un actualizadoEn cambiado por enriquecimiento.
6. CarteleraContext coordina bloqueos y sesión; aplica solo resultados confirmados y guarda caché tras cada uno. Invalida lecturas viejas. Una respuesta de cuenta anterior no actualiza estado/caché visible. El progreso es preparación, no un valor calculado en pantalla.
7. Cancelación cooperativa al cambiar año o salir de pestaña. No iniciar la siguiente obra si signal está abortado, cambió sesión o falta conexión. Un servidor puede confirmar una escritura ya enviada; se concilia de forma idempotente y no se afirma que un timeout la canceló.
8. Una apertura offline no ejecuta ningún servicio de migración ni TMDB. Las obras sin fecha no se asignan a un año inventado; aviso de recuperación pendiente (PA-03).

## Firestore

Conservar ruta, owner check, tipos anteriores, comentario, estrellas y timestamps. Usar get(campo,default) para documentos antiguos. Campos permitidos: los campos originales + los cuatro nuevos.

- Create requiere campos nuevos, Por ver, null en vistaEn y campos personales vacíos.
- Update solo permite estado, estrellas, comentario, actualizadoEn y campos nuevos; identidad/agregadoEn inmutables.
- Lista de textos hasta diez elementos: comprobar tipo de cada posición existente; no basta is list. Series tienen duración null y directores [].
- Fecha no null solo en Vista. Entrada a Vista exige request.time; salida exige null. Si sigue Vista con fecha, debe conservarla. Para Vista anterior sin fecha: se puede mantener ausente/null al editar o migrar exactamente a resource.data.actualizadoEn.
- Duración negativa, cero, fracción, >1000 o texto se rechazan. Otro usuario y un anónimo siguen denegados.
- Probar en emulador, además del simulador/dos cuentas reales que debe comprobar el estudiante. No rebajar reglas para probar la app.

## Diseño y pantalla

Aplicar DESIGN.md, sin copiar valores en pantallas. T-13 crea src/tema y centraliza tokens; el test de colores pasa de rojo a verde al terminar la migración. SVG oficial de TMDB conservado sin redibujar. No introducir librerías de gráficas.

T-14 incorpora TarjetaDato, Preferencia, BarrasMes, ObraDestacada y SelectorAnio con View/Text y controles existentes. T-15 agrega estados, progreso, reintento e Ir a Mi lista. MiAnioScreen solo presenta resultados del dominio y coordina eventos: no calcula reglas ni llama Firebase.

## Plan por tickets para revisión antes de interfaz

1. T-07: tests rojos de dominio/plan y evidencia, antes de implementar.
2. T-08/T-09: fechas, transiciones, metadatos y cálculo puro hasta verde (el sensor de colores sigue rojo hasta T-13, tal como exige H2).
3. T-10/T-11/T-12: servicios, persistencia compatible, reglas y preparación con pruebas de secuencialidad/aislamiento.
4. T-13: tokens revisados y migración de las pantallas anteriores; sensor de colores a verde.
5. T-14: componentes y nueva pestaña según brand board, usando solo dominio/tokens/Context.
6. T-15/T-16: estados, accesibilidad, verificación automática y guía humana/demo; resultados reales pendientes se identifican.

Este es el plan concreto de interfaz que debe revisar/aprobar el estudiante, además de revisar los diffs antes del commit. No equivale a afirmar una prueba humana completada.

## Trazabilidad criterio → verificación

| Criterio | Verificación asignada                                                         |
| -------- | ----------------------------------------------------------------------------- |
| CA-01    | visionado.test: D1 entrar; reglas: entrada requiere serverTimestamp; teléfono |
| CA-02    | visionado.test: conservar; reglas: fecha inmutable en Vista                   |
| CA-03    | visionado.test: salir; reglas: null; teléfono                                 |
| CA-04    | visionado.test: volver; resumenAnual.test: cuenta una vez                     |
| CA-05    | metadatos.test: película/límites; servicio TMDB; documento real pendiente     |
| CA-06    | metadatos.test: serie; reglas de serie                                        |
| CA-07    | resumenAnual.test: límites locales y zonas explícitas                         |
| CA-08    | resumenAnual.test: suma y redondeo; formato en UI                             |
| CA-09    | resumenAnual.test: películas sin duración                                     |
| CA-10    | resumenAnual.test: géneros múltiples/deduplicados                             |
| CA-11    | resumenAnual.test: desempates por media, sin notas y alfabeto                 |
| CA-12    | resumenAnual.test: directores y exclusión de series                           |
| CA-13    | resumenAnual.test: director null; mensaje de UI                               |
| CA-14    | resumenAnual.test: doce meses/ceros; etiquetas UI                             |
| CA-15    | resumenAnual.test: empate mensual reciente                                    |
| CA-16    | resumenAnual.test: destacada y fecha; navegación                              |
| CA-17    | resumenAnual.test: sin calificadas; invitación UI                             |
| CA-18    | resumenAnual.test: selector único/descendente/actual                          |
| CA-19    | integración/UI: selección actual inicial                                      |
| CA-20    | dominio y preparación: cambio de año/cancelación                              |
| CA-21    | visionado.test: fallback actualizadoEn; transacción en emulador               |
| CA-22    | visionado.test: idempotencia; reglas fecha ya guardada                        |
| CA-23    | plan de preparación + orquestador: máximo una petición activa                 |
| CA-24    | dominio parcial + orquestador con fallo por obra + mensaje                    |
| CA-25    | emulador: migración y edición concurrentes sin perder campos                  |
| CA-26    | metadatos.test: presencia frente a valores vacíos; orquestador                |
| CA-27    | dominio vacío + botón de navegación                                           |
| CA-28    | plan offline + orquestador sin llamadas + caché                               |
| CA-29    | plan offline + aviso de fechas pendientes, sin atribuir año                   |
| CA-30    | integración: error sin copia, reintento                                       |
| CA-31    | preparación con cancelación y respuestas retrasadas; guardas de sesión        |

## Verificación y entrega

Vitest, suite original, TypeScript, lint, reglas en emulador, bundles y revisión de interfaz. docs/VERIFICACION.md distingue resultado automático de prueba humana y deja columna real pendiente. docs/IA.md recoge cinco momentos reales, sin inventar correcciones del estudiante. Actualizar auditoría y README; demo de cinco minutos y experimento controlado del sensor sin dejar código roto.

## Publicación y puntos abiertos

Las reglas productivas y el push dependen de acceso autorizado al proyecto/cuenta. No se inventa publicación. PA-01–PA-05 siguen visibles en PRD; las propuestas técnicas aprobadas por el estudiante conservan trazabilidad y no se presentan como respuestas del docente. No se incluyen claves en paquetes ni historial.

### Ajuste de orden propuesto para el sensor

La centralización de los colores legados se hará junto a la creación de tokens en T-13/H3, para poder pasar npm test antes de confirmar el código de dominio/datos. La adopción completa de escalas y la nueva interfaz siguen en H4. Así se conserva la evidencia roja sin desactivar un sensor ni mantener un commit funcional con tests fallando. Este ajuste se presentó al estudiante para revisión.
