# Procedencia y repetición de la prueba de interfaz

Resultado de esta sesión: H4-UI-local.txt. Capturas resumen-*-local.png. La app es la exportación real de Expo web, no una maqueta HTML. Navegador Chromium en 390×844, calendario America/Guayaquil; cuentas ficticias en Auth Emulator, documentos legados en Firestore Emulator y respuestas TMDB interceptadas. Ningún servicio de producción se modifica.

El runner opcional es scripts/verificar-ui-local.cjs. No se incorpora una dependencia nativa ni una librería de gráficas. Usa Playwright y Chrome de un entorno externo de pruebas; no es requisito de npm test ni de Expo Go. Los fixtures tienen años 2025/2024 y esperan un año actual posterior a 2025; revisarlos al reutilizar la demostración en otro curso.

Para repetir en un entorno con Playwright disponible:

1. Generar la exportación web con `EXPO_NO_DOTENV=1`, configuración ficticia completa para demo-cartelera, token ficticio de TMDB, EXPO_PUBLIC_USE_EMULATORS=true y EXPO_PUBLIC_EMULATOR_HOST=127.0.0.1. Usar `npx expo export --platform web --output-dir dist-ui`. Nunca generar esta prueba contra un Firebase real. El runner intercepta TMDB y sirve la exportación en 127.0.0.1:8765.
2. CARTELERA_WEB_EXPORT permite elegir otra carpeta de exportación; CARTELERA_PLAYWRIGHT_PATH permite indicar un módulo Playwright externo; CARTELERA_CHROME permite indicar su ejecutable. No contienen secretos. Si no se indican las dos últimas, el runner intenta resolver Playwright y su Chromium instalado.
3. Con Java 21+ ejecutar `npx firebase emulators:exec --only auth,firestore --project demo-cartelera "node scripts/verificar-ui-local.cjs"`.
4. El script crea cuentas locales, migra cuatro documentos antiguos de dos años, simula un fallo TMDB, reintenta, modifica una opinión durante una petición, edita la destacada, pasa a offline, cambia de cuenta y provoca/recupera un error inicial sin caché. Verifica además que las pestañas permanecen visibles al desplazar y que no hay desbordamiento horizontal.

Los archivos de salida se escriben en docs/evidencia. El documento JSON incluye una advertencia de procedencia emulada y conserva los valores leídos. La imagen tests-verde.png presenta la salida real guardada de npm test; no es una captura de una terminal del estudiante. Las capturas requeridas de Firebase productivo y Expo Go las obtiene Ian después de su propia verificación.

Los fallos iniciales del runner se debieron a selectores demasiado estrictos para nombres accesibles que incluían glifos y a buscar avisos también en pestañas ocultas. Se ajustaron los selectores y se añadieron nombres explícitos a las pestañas. No se relajaron las comprobaciones de negocio para lograr el verde.
