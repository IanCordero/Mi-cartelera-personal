# Mi Cartelera Personal · instrucciones del proyecto

App móvil Expo SDK 58, React Native y TypeScript. Firebase Auth identifica al usuario; Firestore Lite guarda su lista privada y AsyncStorage conserva una copia offline. TMDB aporta películas/series. La extensión actual es «Mi año en cine».

## Leer antes de actuar

1. Leer SPEC.md y docs/AUDITORIA.md para entender la base P3 y sus límites.
2. Leer el PRD, backlog y spec del ticket antes de escribir su implementación. Si faltan, preparar los documentos primero.
3. **Antes de modificar cualquier pantalla o componente, leer DESIGN.md. Si no existe o no está revisado por el estudiante, detener la implementación de UI y solicitar esa revisión.**
4. Conservar el orden del enunciado: auditoría/harness → PRD/diseño → spec/tests/dominio/datos → interfaz/verificación. No presentar una revisión automática como aprobación del estudiante.

## Capas y carpetas

- src/screens y src/components: interfaz y controles accesibles; no importar Firebase ni realizar fetch.
- src/navigation: React Navigation, pila y pestañas tipadas; no migrar a Expo Router.
- src/context: sesión, estado global, caché y coordinación de operaciones; conservar guardas por sesión y lecturas obsoletas.
- src/services: único lugar de las operaciones de Firebase/TMDB y persistencia local.
- src/firebase: inicialización y selección de emuladores; no lógica de pantalla.
- src/types y src/utils: contratos y validaciones.
- src/dominio: funciones puras de fechas, transiciones y resumen. Recibir reloj/año/calendario por parámetros; no leer Date.now ni crear una fecha actual dentro del dominio.
- src/tema: única fuente de verdad de colores, tamaños y espacios, coherente con DESIGN.md y el brand board.
- docs/prd, docs/backlog, docs/specs, docs/diseno: documentos que preceden al código.

## Seguridad y preservación

- **Nunca leer, imprimir, copiar, editar ni enviar .env o sus variantes con credenciales.** No solicitar claves ni tokens en el chat. Solo .env.example contiene nombres de variables y valores vacíos.
- Para invocar Expo durante trabajo del agente usar EXPO_NO_DOTENV=1, evitando su carga automática de archivos privados.
- No usar any injustificado, @ts-ignore ni desactivar sensores para lograr un resultado verde.
- No borrar documentos antiguos para adaptar el modelo. Migraciones idempotentes, por usuario y sin escrituras offline.
- Mantener el aislamiento usuarios/{uid}/mi_lista/{tipo_id}, timestamps de servidor y prohibición de estrellas fuera de Vista.
- Conservar atribución y logo oficial de TMDB, menos prominente que la marca propia.
- Toda petición maneja carga, error y éxito. Borrar requiere confirmación y los controles tocan al menos 44 unidades lógicas.

## Comandos

- Instalar exactamente la base: npm ci.
- Nueva dependencia: EXPO_NO_DOTENV=1 npx expo install [paquete]; justificarla primero en la spec. Desarrollo: añadir --dev.
- Sensores: npm test, npx tsc --noEmit y npm run lint.
- Regresión P3: npm run test:legado. Firestore emulado: npm run test:rules (Java 21 o superior).
- App humana: npm run dev; la configuración privada la realiza el estudiante fuera del chat.
- Formato automático: hook .claude/hooks/formato.mjs tras Write/Edit/MultiEdit; al editar con otra herramienta ejecutar el mismo formateo explícitamente sobre cada archivo editado.

## Git y revisión

- Base: etiqueta p3-final; trabajo en epica-mi-anio. Nunca reescribir el historial del Proyecto 3 ni hacer force-push.
- Commits en español con prefijo docs:, feat:, fix:, test: o chore:. Usar la skill local /commit al trabajar con Claude Code.
- Mostrar el diff y obtener la revisión del estudiante antes de cada commit; no inventar revisiones ni aprobación de un diseño.
- Los commits docs: preceden a su implementación. npm test y npx tsc --noEmit pasan antes de cada commit de código.
- Excepción expresa y limitada del enunciado: Hito 2 registra el sensor de colores en rojo y Hito 3 registra tests del dominio en rojo antes de implementarlo. Conservar la evidencia roja; no desactivar ni borrar esos tests. Fuera de esas fases, no confirmar código con sensores fallando.
- No publicar reglas de Firebase ni marcar pruebas humanas como hechas sin evidencia real. Registrar lo pendiente en docs/VERIFICACION.md y docs/IA.md.

## Documentación técnica

Expo cambia entre SDK: consultar https://docs.expo.dev/versions/v58.0.0/ para APIs nativas y https://docs.expo.dev/llms.txt para páginas específicas. No crear ios/ o android/ manualmente. Los módulos nativos nuevos deben ser compatibles con Expo Go.
