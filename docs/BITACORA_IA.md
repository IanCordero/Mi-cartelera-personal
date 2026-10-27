# Bitácora de uso de IA

## Declaración

Se utilizó ChatGPT/Codex para generar una primera implementación del proyecto a partir del enunciado, organizar las capas, redactar documentación, reforzar reglas de Firestore y preparar/ejecutar comprobaciones automáticas. No se debe presentar el código como escrito sin asistencia.

## Registro

| Actividad asistida | Resultado y revisión necesaria |
| --- | --- |
| Convertir requisitos RF1–RF10 en estructura | Pantallas, servicios, Context y tipos; revisar con ARQUITECTURA.md |
| Integración Firebase | Auth persistente, CRUD con transacciones y caché por usuario; configurar proyecto propio |
| Integración TMDB | Bearer, búsqueda, configuración de imágenes y credits; verificar con token real |
| Reglas de seguridad | Aislamiento A/B y validación de negocio; publicar y repetir pruebas en proyecto real |
| Diagnóstico | Ajuste de tipos Firebase para React Native y dependencias compatibles con Expo |
| Pruebas | Consultar PRUEBAS.md; las pruebas simuladas no acreditan llamadas a servicios reales |
| Documentación | Guía de instalación, GitHub, demo y casos manuales |

## Lo que debo poder explicar en clase

1. Diferencia entre Firebase Auth y Firestore.
2. Por qué el uid está en la ruta y cómo las reglas lo comparan con request.auth.uid.
3. Por qué movie_550 y tv_550 son documentos diferentes.
4. Cómo impide la transacción agregar dos veces la misma obra.
5. Qué significa EstadoPeticion<T> y cómo se muestran cargando/error/éxito.
6. Cómo credits evita una segunda petición de elenco.
7. Por qué las estrellas se eliminan fuera del estado Vista y cómo lo valida el servidor.
8. Cómo se separa la caché por usuario y cuándo se refresca.
9. Por qué un timeout no garantiza cancelar una escritura.
10. Por qué una variable EXPO_PUBLIC no es un secreto dentro del paquete.

## Completar antes de entregar

- Nombre del estudiante/equipo:
- Fecha de revisión propia:
- Cambios realizados manualmente:
- Problemas encontrados en el teléfono y solución:
- Funciones que expliqué y comprobé personalmente:

No marques como ejecutada una prueba que solo leíste. Completa el registro con lo que realmente observaste.
