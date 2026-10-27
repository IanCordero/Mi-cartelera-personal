# Arquitectura y decisiones

## Flujo

Las pantallas usan CarteleraContext para Auth y la lista, y tmdbService para el catálogo. Ninguna pantalla importa Firebase ni realiza fetch directamente. `firebase/config.ts` únicamente inicializa SDK, persistencia y emuladores; los servicios ejecutan las operaciones.

- `types/`: tipos unión, interfaces de dominio/TMDB y EstadoPeticion<T>.
- `services/authService.ts`: registro, login, logout y observador de sesión.
- `services/tmdbService.ts`: Bearer token, es-ES, búsqueda multi (filtra personas), páginas y detalle con credits en una petición. Configuración de imágenes cacheada en memoria; tamaño w185 en listas y w500 en fichas, con URL HTTPS de respaldo si /configuration falla.
- `services/listaService.ts`: CRUD en usuarios/{uid}/mi_lista/{tipo_id}. Transacciones para agregar sin sobrescribir una entrada existente y preservar timestamps.
- `services/cacheService.ts`: JSON validado y clave @cartelera:v1:UID. Escrituras serializadas por cuenta.
- `context/`: sesión, lista, conectividad, copia local y acciones. Generaciones de sesión descartan respuestas de la cuenta anterior. Identificadores de lectura descartan consultas anteriores a una mutación.
- `navigation/`: React Navigation 7, pestañas inferiores dentro de pila, desmontaje de navegación al cerrar sesión. Se usa React Navigation directamente porque lo exige el enunciado, aunque AGENTS.md de la plantilla recomienda Expo Router para proyectos generales.
- `components/`: tarjetas, póster con reemplazo, estrellas y controles de 44 px o más.

## Sesión

Firebase Auth usa getReactNativePersistence(AsyncStorage) en iOS/Android. En web usa la persistencia estándar de Firebase Auth. La pequeña ampliación `.d.ts` soluciona la omisión de getReactNativePersistence en la entrada de tipos web del SDK Firebase 12. No reimplementa Firebase ni usa any.

La app no necesita un documento de perfil: Firebase Auth administra la cuenta y el uid en la ruta aísla la lista. Crear documentos de perfil no forma parte de los requisitos funcionales. Las reglas deniegan por defecto perfiles y otras rutas no usadas.

## Firestore y caché

Se usa `firebase/firestore/lite`, parte oficial del SDK JavaScript, para evitar colas implícitas de escritura offline. AsyncStorage aporta explícitamente el último estado confirmado de la lista. No hay un listener permanente: la lista se consulta al abrir sesión, volver a primer plano, recuperar conexión, refrescar manualmente y terminar una mutación.

Una escritura confirmada actualiza inmediatamente el estado y la caché, y después vuelve a leer para reemplazar los timestamps provisionales de presentación por los definitivos del servidor. No se muestra una operación fallida como guardada. Si falla la caché tras un guardado remoto, se informa por separado.

Las peticiones TMDB tienen AbortController de 12 segundos. Lecturas y escrituras Firestore tienen un límite de espera de interfaz de 12 segundos. Un timeout no cancela una transacción que pudo llegar al servidor: se informa que el resultado no está confirmado, se mantiene un bloqueo hasta que termine y se concilia una respuesta tardía. No es una garantía de cancelación. Después de una pérdida de red prolongada, actualizar la lista antes de reintentar. Las transacciones de Firestore pueden realizar reintentos internos.

En navegador redService.web.ts escucha directamente los eventos online/offline de window; evita falsos negativos de las sondas HTTP y diferencias en NetworkInformation; los servicios siguen mostrando fallos de red reales. En móvil se considera también isInternetReachable de NetInfo.

El modo offline es de consulta. No admite nuevas altas, cambios ni borrados sin conexión. La caché persiste al cerrar sesión para que la misma cuenta pueda reutilizarla; no se carga para otra cuenta. AsyncStorage no cifra el archivo local: la privacidad exigida en servidor depende de Auth y las reglas; la protección física del dispositivo queda fuera del proyecto.

## Reglas

Validan autenticación y propietario, campos exactos, id compuesto, tipo, id positivo, título, año, póster, estado, comentario, estrellas enteras y regla Vista. Las altas requieren Por ver y campos personales vacíos. En update solo se modifican estado, estrellas, comentario y actualizadoEn. Ambos timestamps se generan con serverTimestamp; agregadoEn es inmutable y actualizadoEn debe coincidir con request.time.

## Límites y mejoras futuras

- No se incluye proxy Express: no es un requisito obligatorio y el apartado 1.10 no fue proporcionado. El token EXPO_PUBLIC_TMDB_TOKEN es recuperable del paquete. Un proxy debe proteger su propio acceso y no se sustituye con un secreto dentro de Expo.
- La búsqueda multi también encuentra personas; se excluyen de los resultados de cada página. Una página puede quedar vacía y conservar Cargar más.
- Las búsquedas no se almacenan offline; solo la lista personal. Las imágenes dependen de la caché de red del sistema; un fallo muestra un icono.
- Los comentarios se limitan a 500 puntos de código Unicode; una secuencia de emoji con varios símbolos puede consumir más de un carácter.
- Sin sincronización en tiempo real entre dos dispositivos. Volver a primer plano o actualizar consulta la versión del servidor. En edición concurrente, la última actualización confirmada de los campos personales prevalece.
- No se incluyen cuentas, claves, capturas de Firebase real ni afirmaciones de haber probado un dispositivo físico.
