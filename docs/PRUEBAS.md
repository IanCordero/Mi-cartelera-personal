# Registro de pruebas

## Ejecutado automáticamente durante la construcción

Estas verificaciones se ejecutaron sobre el código entregado, sin credenciales privadas del estudiante.

| Comprobación | Resultado | Alcance |
| --- | --- | --- |
| npm run typecheck | Aprobado | TypeScript estricto en código y pruebas |
| npm run lint | Aprobado | ESLint con configuración de Expo |
| npm test | 11/11 aprobadas | Identidad compuesta, calificaciones, comentarios, caché válida/corrupta, validación de credenciales, errores y tiempo máximo; respuestas TMDB simuladas |
| npm run test:rules | 8/8 aprobadas | Emulador oficial Firestore 1.22, proyecto demo-cartelera, Java 21 |
| npm run doctor | 20/20 aprobadas | Dependencias y configuración de Expo |
| npm run export:android | Aprobado | Metro genera bundle Android/Hermes; no acredita ejecución en teléfono |
| npm run export:web | Aprobado | Metro genera paquete web; no sustituye la demo móvil |
| Exportación iOS | Aprobado | Metro genera bundle iOS/Hermes; sin ejecución en iPhone |
| Integración UI local | 10 escenarios aprobados, sin errores de JavaScript | Chromium, viewport móvil, Auth/Firestore emulados y TMDB simulado |

Las denegaciones PERMISSION_DENIED que se imprimen durante test:rules son esperadas: las pruebas afirman que una operación inválida debe fallar.

## Pruebas de reglas ejecutadas

1. CRUD y lectura de colección del usuario propietario.
2. Denegación de lectura/listado/alta/actualización/borrado de B sobre A.
3. Usuario sin autenticar no puede leer ni escribir.
4. Altas con estrellas, estado no inicial, comentario prellenado o campos desconocidos se rechazan.
5. El id coincide con tipo y tmdbId; timestamps falsificados e id negativo se rechazan.
6. Solo Vista admite estrellas enteras entre 1 y 5; null es permitido.
7. Se aceptan 500 caracteres, se rechazan 501 y no se permite cambiar identidad ni agregadoEn.
8. Película y serie con mismo número pueden coexistir; una alta no puede sobrescribir la opinión existente.

## Integración de interfaz ejecutada localmente

Se usó una exportación web de la misma aplicación con configuración ficticia y emuladores oficiales. No se usaron cuentas del estudiante ni un token real de TMDB. Se comprobó:

1. Registro de cuenta A en Auth emulado.
2. Alta con transacción en Firestore Lite desde la ficha y reemplazos sin póster/sinopsis.
3. Edición de estado, estrellas y comentario.
4. Sesión conservada tras recargar.
5. Lista recuperada después de recargar.
6. Copia local visible al desconectar la red y recuperación al reconectarla.
7. Créditos y cierre de sesión.
8. Cuenta B con lista vacía, sin leer la caché de A.
9. Regreso a A: cambiar a Viendo deshabilita/elimina estrellas y conserva el comentario.
10. Cancelar borrado conserva la entrada; confirmar borrado la elimina.

La revisión visual corrigió el espacio inferior de las pestañas. La prueba de reconexión permitió corregir la suscripción a online/offline en navegador; la versión móvil sigue usando NetInfo. El diálogo de borrado es un Modal de React Native y no depende de un confirm del navegador.

## Pendiente con cuentas reales y dispositivo

| Caso | Estado | Evidencia a completar |
| --- | --- | --- |
| Token real de TMDB y búsqueda fuera de la app | Pendiente | Salida de npm run check:tmdb sin token visible |
| Registro/login/logout en Firebase real | Pendiente | Authentication → Users |
| Persistencia de sesión al cerrar y abrir Expo Go | Pendiente | Observación en dispositivo |
| Película y serie con TMDB real | Pendiente | Fichas y elenco |
| Paginación y fallos de red en dispositivo | Pendiente | Observación de carga/error/reintento |
| Alta repetida, filtros, edición y borrado confirmado | Pendiente | Pantallas y documentos reales |
| Lista con al menos tres documentos | Pendiente | Captura de mi_lista |
| Modo avión y vuelta a conexión | Pendiente | Aviso y copia local |
| Cambio entre cuentas A/B en dispositivo | Pendiente | Listas aisladas y caché por cuenta |
| Reglas publicadas y simulador de Firebase real | Pendiente | Captura de acceso ajeno denegado |
| Repositorio remoto y colaborador docente | Pendiente | URL real de GitHub |

## Errores no resueltos

Las verificaciones pendientes no se registran como errores observados. Si alguna falla al ejecutarla, completa una fila con lo que realmente ocurrió.

| Ticket | Qué intenté | Qué observé | Hipótesis |
| --- | --- | --- | --- |
| Completar solo si queda un error después de probar | | | |
