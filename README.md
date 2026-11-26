# Mi Cartelera Personal · Mi año en cine

App móvil académica de Ian Cordero: busca películas y series en TMDB y mantiene una lista privada en Firebase. La épica **Mi año en cine** añade fecha de visionado, totales por año, horas de películas, género/director favoritos, doce meses y la obra mejor calificada.

Conserva el Proyecto 3 y su historial: base `p3-final` en `94f278c`, desarrollo en `epica-mi-anio`. La rama y etiqueta están preparadas localmente; comprobar su publicación en GitHub antes de entregar.

## Instalación y ejecución

1. Instalar Node.js ≥22.13 y Expo Go compatible con Expo SDK 58, según la versión indicada por el docente.
2. Clonar el repositorio y seleccionar `epica-mi-anio` cuando esté publicada. Ejecutar `npm ci`.
3. Copiar `.env.example` a `.env` y completar **localmente** las variables. No enviar claves al agente ni subir ese archivo a GitHub.
4. En Firebase activar Email/Password y crear Firestore. Revisar `firestore.rules` y publicarlo en el proyecto propio desde la consola o con `npx firebase deploy --only firestore:rules --project TU_ID_DE_PROYECTO` después de iniciar sesión en Firebase CLI. Las pruebas locales no publican reglas.
5. Ejecutar `npm run dev`. Abrir con Expo Go en la misma red Wi-Fi. Si se pierde conexión, la lista y el resumen usan la última copia de AsyncStorage; guardar cambios requiere conexión.

Variables: `EXPO_PUBLIC_TMDB_TOKEN`, `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID`. El token es el API Read Access Token, sin prefijo Bearer. La app agrega el prefijo.

Los valores EXPO_PUBLIC forman parte del paquete; el token TMDB es visible al inspeccionarlo. El aislamiento depende de Auth y las reglas, no de ocultar la configuración Firebase. Uso académico no comercial. Para producción con token privado se necesitaría un backend, fuera de esta épica.

## Pantallas y reglas principales

Login/Registro → Buscar / Mi lista / **Mi año** / Acerca de; pila con Detalle y Editar. Se mantienen filtros, estrellas solo en Vista, comentarios hasta 500 caracteres, confirmación de borrado y atribución TMDB.

- Entrar a Vista guarda vistaEn del servidor; salir la borra. Editar una opinión conserva la fecha.
- El año usa el calendario local del dispositivo y cada obra cuenta una vez. El selector incluye años con obras y el actual.
- Las obras antiguas recuperan vistaEn de su actualizadoEn anterior al abrir el resumen. Se hace primero la fecha y después los metadatos del año elegido, uno por uno y con progreso.
- Si una petición falla, la obra sigue en total/meses/destacada; se informa cuántas carecen de metadatos. Las series nunca suman horas ni directores.
- Ausente es distinto de vacío: géneros/directores vacíos y duración null válidos no se vuelven a consultar constantemente. Offline no hay migraciones ni llamadas de enriquecimiento.

## Verificación

```sh
npm test
npx tsc --noEmit
npm run lint
npm run test:rules
```

`npm test` ejecuta Vitest y conserva los 11 tests originales de P3. El sensor de colores examina el código de la app fuera de src/tema; los tokens se contrastan con el brand board. La suite de reglas requiere **Java 21+** y usa únicamente el proyecto emulado demo-cartelera. No hacen falta credenciales reales para estas pruebas.

Los resultados ejecutados de esta épica se detallan en [docs/VERIFICACION.md](docs/VERIFICACION.md). Las pruebas en Expo Go, las capturas de la consola Firebase real y el ensayo de demo deben completarse personalmente. Los resultados históricos de P3 en docs/PRUEBAS.md no acreditan la nueva épica.

## Arquitectura y trazabilidad

React Native/Expo + React Navigation + Context API. services es la única capa de acceso a Firebase/TMDB/caché. dominio contiene cálculo puro con año y zona recibidos; tema concentra los valores visuales. Firestore Lite no encola escrituras offline; AsyncStorage conserva una copia por uid. Las migraciones son transaccionales y se concilian respuestas tardías con guardas por sesión.

Leer [AGENTS.md](AGENTS.md), [SPEC.md](SPEC.md), [auditoría](docs/AUDITORIA.md), [PRD](docs/prd/MI-ANIO-EN-CINE.md), [backlog](docs/backlog/EPICA-MI-ANIO.md), [spec](docs/specs/01-mi-anio-en-cine.md) y [DESIGN.md](DESIGN.md). Abrir [brand-board.html](docs/diseno/brand-board.html) directamente en el navegador. La [bitácora](docs/IA.md) identifica uso de IA y la [demo](docs/DEMO.md) contiene el guion de cinco minutos.

El harness de Claude Code está en CLAUDE.md y .claude/: skill /commit en español y hook PostToolUse de Prettier. Comprobar /context y /hooks dentro de Claude Code y revisar el diff antes de cada commit. El trabajo de implementación se realizó con Codex; no se presenta como una ejecución de Claude Code.

## Atribución

This product uses the TMDB API but is not endorsed or certified by TMDB.

Datos e imágenes de [TMDB](https://www.themoviedb.org/). El logo oficial se conserva en la app y es menos prominente que la marca propia.
