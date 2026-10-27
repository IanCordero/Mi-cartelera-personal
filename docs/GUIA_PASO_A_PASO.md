# Guía de inicio · Mi Cartelera Personal

## Qué recibes y qué debes configurar

El ZIP contiene el código completo, las reglas, pruebas automáticas, esta guía y la bitácora de uso de IA. No contiene credenciales ni node_modules. Necesitas una cuenta personal de Firebase, una de TMDB y tu cuenta de GitHub. No pegues contraseñas ni tokens en el chat, las capturas o el repositorio.

Se creó con la plantilla oficial blank-typescript de Expo, SDK 58.0.19, React Native 0.88 y React 19.3. Las versiones exactas están en package-lock.json. El enunciado no fija un SDK: confirma con tu profesor antes de cambiarlo. Actualiza Expo Go y comprueba que admita SDK 58; si el docente exige otro SDK, adapta las dependencias con la guía oficial de actualización de Expo y repite las pruebas. No cambies solamente el número de expo en package.json.

## 1. Abrir en Visual Studio Code

1. Extrae el ZIP en una carpeta de tu computadora, por ejemplo `Documentos/mi-cartelera-personal`.
2. Abre Visual Studio Code → Archivo → Abrir carpeta. Selecciona la carpeta que contiene package.json.
3. Instala Node.js LTS 22.13 o superior (recomendado Node 24 LTS). Si lo acabas de instalar, cierra y abre Visual Studio Code.
4. Abre Terminal → Nueva terminal y escribe:

```sh
node --version
npm --version
npm install
```

No crees otro proyecto de Expo: este ya está creado. `npm install` puede tardar unos minutos. El paquete firebase-tools se incluye para las pruebas del emulador y agrega dependencias de desarrollo; no forma parte de la app distribuida.

## 2. Crear Firebase

1. Entra a https://console.firebase.google.com/ con tu cuenta.
2. Crea un proyecto, por ejemplo `Mi Cartelera Personal`. Analytics es opcional y esta app no lo usa.
3. En la página del proyecto, agrega una **app web** con el botón `</>`. Aunque la app se ejecute en Android o iPhone, aquí usamos el SDK JavaScript compatible con Expo Go.
4. Dale un nombre, por ejemplo `cartelera-expo`. No necesitas activar Hosting.
5. Firebase mostrará un objeto firebaseConfig. Sus valores van en `.env`, no en el código.
6. Authentication → Comenzar → Método de acceso → Correo electrónico/contraseña → Activar. No actives únicamente el enlace por correo: esta app usa contraseña.
7. Firestore Database → Crear base de datos → edición Standard, base `(default)` → elige una ubicación cercana y crea la base en **modo producción**.
8. En Firestore → Reglas, reemplaza el contenido completo con el archivo `firestore.rules` de este proyecto y pulsa **Publicar**. No reemplaces las reglas por `allow read, write: if true`.

No necesitas Storage, Google Analytics, archivo google-services.json ni una tarjeta de crédito para las funciones básicas de esta app. Los documentos de lista se crearán al guardar la primera obra. No necesitas crear a mano `usuarios/{uid}`: una subcolección puede existir sin documento de perfil.

## 3. Obtener el token de TMDB

1. Crea una cuenta en https://www.themoviedb.org/ y verifica tu correo.
2. En Configuración de tu cuenta → API, solicita acceso de desarrollador para uso no comercial.
3. Descripción sugerida: “Proyecto universitario no comercial. App móvil en Expo para buscar películas y series y organizar una lista personal privada. Se atribuye a TMDB en la pantalla de créditos”.
4. Si pide una URL, usa una URL de desarrollo que acepte el formulario, por ejemplo `http://localhost:8081`, o la dirección real de tu repositorio. No inventes una app publicada.
5. Copia **API Read Access Token**. Es el token largo, distinto de la clave API v3. Pégalo sin el prefijo `Bearer`: el servicio agrega ese prefijo automáticamente.

## 4. Crear el archivo .env

En el explorador de Visual Studio Code, copia `.env.example`, pega y renombra la copia como `.env`. Conserva el archivo de ejemplo sin valores reales.

Relaciona los campos así:

| Variable de .env | Campo en firebaseConfig |
| --- | --- |
| EXPO_PUBLIC_FIREBASE_API_KEY | apiKey |
| EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN | authDomain |
| EXPO_PUBLIC_FIREBASE_PROJECT_ID | projectId |
| EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET | storageBucket |
| EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | messagingSenderId |
| EXPO_PUBLIC_FIREBASE_APP_ID | appId |

Además completa `EXPO_PUBLIC_TMDB_TOKEN`. Deja `EXPO_PUBLIC_USE_EMULATORS=false` para usar Firebase real. No agregues comas, llaves, punto y coma ni espacios dentro de los valores. Guarda el archivo.

Comprueba el token fuera de la app:

```sh
npm run check:tmdb
```

Debe mostrar “Token verificado” y el primer resultado de Matrix. El script no imprime el token. Si responde 401, revisa que sea el API Read Access Token correcto.

## 5. Abrir en el teléfono

```sh
npm run dev
```

1. Instala/actualiza Expo Go en tu teléfono.
2. Conecta la computadora y el teléfono a la misma red Wi-Fi.
3. Android: abre Expo Go y escanea el QR. iPhone: escanea con Cámara y abre el enlace en Expo Go.
4. Crea una cuenta desde la app; busca una película; agrégala a tu lista.
5. Si cambias `.env`, detén Expo con Ctrl+C y ejecuta `npm run dev -- --clear`.

Si no conecta, revisa firewall, Wi-Fi y VPN. Como alternativa de conexión puedes probar `npx expo start --tunnel`; Expo puede solicitar instalar su dependencia de túnel. La presentación final debe probarse en un dispositivo con Expo; el navegador es una comprobación adicional y no sustituye esa demo. Para una comprobación de escritorio puedes ejecutar `npm run web`.

## 6. Comprobar los requisitos, en orden

### Base

- Registra una cuenta A, revisa Authentication → Users y toma una captura.
- Cierra sesión e inicia de nuevo; verifica un error con contraseña equivocada.
- Cierra por completo Expo Go y vuelve a abrir el proyecto: la sesión debe conservarse.
- Ejecuta `npm run typecheck` y `npm run lint`.

### Catálogo

- Busca una película y una serie y abre ambas fichas.
- Revisa sinopsis, puntuación y elenco.
- Busca un texto inexistente, por ejemplo `zzzxxyy001234987`.
- Prueba un título sin póster; una imagen que falla debe mostrar un icono de reemplazo.
- Revisa la paginación usando Cargar más resultados.

### Lista

- Guarda por lo menos tres obras, incluyendo una película y una serie.
- Intenta agregar una obra repetida: debe aparecer “En tu lista · Editar entrada”, sin un segundo documento.
- Aplica los filtros por estado y por tipo.
- Marca una obra como Vista, asigna estrellas, escribe un comentario y guarda.
- Cambia de Vista a Viendo: se eliminan las estrellas. Las reglas también rechazan una calificación fuera de Vista.
- Quita una obra: primero cancela y comprueba que sigue; luego confirma.
- Revisa Firestore → Datos → usuarios → uid de A → mi_lista. Deben verse los campos y timestamps.
- Actualiza la lista con internet. Activa modo avión y **recarga la app ya instalada en Expo Go** para comprobar el arranque offline; Metro puede necesitar red para cargar inicialmente el bundle en desarrollo. Si Expo Go no conserva el bundle, demuestra primero el modo avión sin cerrar la app y documenta esa limitación de desarrollo.
- Verás la última copia con un aviso. El catálogo y las modificaciones necesitan internet. No hay una cola de cambios offline.
- Desactiva modo avión: la app vuelve a consultar la lista. También puedes tocar Actualizar lista.

### Seguridad con dos cuentas

- Crea B y confirma que su lista no contiene los títulos de A.
- En Firestore → Reglas → Playground / Simulador, prueba una lectura de `usuarios/UID_DE_A/mi_lista/movie_550`, con autenticación de UID_DE_B.
- Usa un id que exista realmente en la lista de A. La lectura debe ser denegada. Prueba una actualización con B y comprueba que también se deniega.
- Repite la lectura con UID_DE_A y verifica que se permite.
- Toma la captura de la denegación. El simulador no sustituye la prueba en la app con ambas cuentas.

## 7. Pruebas automáticas de reglas (opcional para ejecutar, incluidas)

Instala Java/JDK 21 o superior y confirma `java --version`. Después:

```sh
npm run test:rules
```

Firebase CLI descargará el emulador y correrá las pruebas sobre un proyecto **demo-cartelera**. No usa tus datos reales ni necesita iniciar sesión en Firebase. Necesitas internet en la primera descarga y los puertos 8080 y 4400 libres. Las pruebas comprueban el aislamiento A/B, usuario anónimo, timestamps, ids, calificaciones y comentarios.

Para conectar manualmente la app a emuladores:

```sh
npx firebase emulators:start --only auth,firestore --project demo-cartelera
```

En `.env`, usa los valores ficticios del proyecto demo para Firebase, `EXPO_PUBLIC_USE_EMULATORS=true` y `EXPO_PUBLIC_EMULATOR_HOST` igual a la IP local de tu computadora si abres en un teléfono (127.0.0.1 solo sirve desde la propia computadora; Android Emulator usa habitualmente 10.0.2.2). Reinicia Expo. Para volver a Firebase real restaura los valores y desactiva los emuladores. Las cuentas de emulador no existen en Authentication real.

## 8. Capturas y evidencia

Guarda las capturas reales dentro de `docs/capturas/`:

1. `01-auth-users.png`: usuarios registrados en Firebase real.
2. `02-firestore-lista.png`: subcolección mi_lista con al menos tres documentos.
3. `03-reglas-acceso-denegado.png`: simulador denegando acceso de B a A.
4. `04-buscar.png`, `05-detalle.png`, `06-mi-lista.png`, `07-editar.png`, `08-modo-avion.png`.

No uses imágenes inventadas como evidencia de Firebase. Oculta correos personales si el repositorio es público. No captures `.env` ni el token de TMDB.

## 9. Subir a GitHub

1. Crea un repositorio vacío en GitHub (sin README ni gitignore, porque el proyecto ya los tiene).
2. En la terminal, dentro de la carpeta de package.json:

```sh
git init
git add .
git status
git check-ignore .env
git commit -m "Implementa Mi Cartelera Personal"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mi-cartelera-personal.git
git push -u origin main
```

Reemplaza TU_USUARIO por tu cuenta. `git check-ignore .env` debe mostrar `.env`: significa que se excluye. Si Git pide tu nombre/correo, configura los tuyos con `git config user.name "Tu nombre"` y `git config user.email "Tu correo"`. Si ya existe un remoto, revisa `git remote -v` antes de modificarlo.

Confirma en la web que `.env`, node_modules y dist no están. Si el repositorio es privado, invita al docente desde Settings → Collaborators. Agrega después las capturas con otro commit. La carpeta .github incluye comprobaciones automáticas de TypeScript, lint, tests, reglas y compilación Android.

## 10. Guion breve de la demo

1. Iniciar sesión y explicar Firebase Auth.
2. Buscar una película y una serie; abrir ficha con elenco.
3. Agregar a la lista y demostrar que no se duplica.
4. Filtrar, marcar Vista, calificar y comentar.
5. Cambiar a Viendo y explicar que no puede tener estrellas.
6. Mostrar confirmación al quitar.
7. Activar modo avión y abrir Mi lista con aviso.
8. Mostrar Firestore y la prueba de aislamiento entre cuentas.
9. Abrir Acerca de, mostrar atribución/logo y cerrar sesión.

## Problemas frecuentes

| Mensaje o síntoma | Qué revisar |
| --- | --- |
| Faltan valores de Firebase | Crear .env, copiar todos los campos y reiniciar Expo con --clear |
| auth/operation-not-allowed | Activar proveedor Email/Password |
| Correo o contraseña incorrectos | Cuenta creada en el mismo proyecto Firebase al que apunta .env |
| permission-denied | Publicar firestore.rules y comprobar uid y ruta |
| TMDB 401 | API Read Access Token completo, sin prefijo Bearer ni comillas |
| Lista vacía en modo avión | Cargarla online al menos una vez con esa cuenta y ese dispositivo |
| Confirmación tarda más de 12 segundos | No repetir la operación de inmediato; esperar su conciliación y actualizar |
| Expo Go pide otro SDK | Revisar versión exigida por el docente y compatibilidad de Expo Go |
| PowerShell bloquea npm.ps1 | Usar terminal Command Prompt/cmd o ejecutar npm.cmd, sin cambiar políticas del equipo |

## Documentación oficial consultada

- https://docs.expo.dev/versions/v58.0.0/
- https://docs.expo.dev/guides/using-firebase/
- https://github.com/expo/fyi/blob/main/firebase-js-auth-setup.md
- https://reactnavigation.org/docs/getting-started/
- https://developer.themoviedb.org/docs/image-basics
- https://developer.themoviedb.org/docs/append-to-response
- https://developer.themoviedb.org/docs/faq
- https://firebase.google.com/docs/firestore/manage-data/transactions
