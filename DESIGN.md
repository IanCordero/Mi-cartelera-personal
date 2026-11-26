# Sistema de diseño · Mi Cartelera Personal

Estado: fijado a partir del brand board y documentos aprobados por el estudiante el 25 de noviembre de 2026. Fuente visual: docs/diseno/brand-board.html. Inventario revisado: docs/diseno/propuesta-visual.json. El agente no cambia estas decisiones por su cuenta: cualquier revisión visual posterior se presenta al estudiante.

## Principios

Cinematográfica, íntima y precisa. Mantener azul profundo, lavanda y menta de P3. Una cifra protagonista por bloque; superficies contenidas, sin brillos excesivos. Los datos faltantes se explican. Color, texto e icono trabajan juntos. La interfaz respeta la privacidad de la colección.

## Tokens

Los valores de código viven únicamente en src/tema. El resto de la app importa tokens: no escribe colores hexadecimales ni duplica las escalas. Los documentos/brand board muestran las decisiones para revisión humana, no son una segunda implementación de la app.

### Color

| Token           | Valor       |
| --------------- | ----------- |
| fondo           | `#0B0E17`   |
| superficie      | `#151B2A`   |
| elevada         | `#1D2538`   |
| borde           | `#58667F`   |
| texto           | `#F4F5FA`   |
| textoSecundario | `#A4AEC4`   |
| acento          | `#AEABFF`   |
| acentoSuave     | `#34315C`   |
| porVer          | `#AEABFF`   |
| viendo          | `#89C9FF`   |
| vista           | `#8DE0BD`   |
| error           | `#FF9AAB`   |
| fondoError      | `#3D2131`   |
| fondoVista      | `#19352E`   |
| fondoViendo     | `#20334A`   |
| fondoPorVer     | `#34315C`   |
| sombra          | `#000000BB` |

Texto y cuerpo usan texto o textoSecundario sobre fondo/superficie/elevada. Acción principal: fondo sobre acento. Acción secundaria: acento sobre acentoSuave. Por ver: porVer sobre fondoPorVer; Viendo: viendo sobre fondoViendo; Vista: vista sobre fondoVista. Error: error sobre fondoError. Sombra es una superposición, no un color de texto. Borde delimita controles y foco, no reemplaza texto.

Los doce pares de texto del inventario cumplen 4,5:1. Conservar sus relaciones, no combinar tokens arbitrariamente. En particular, comprobar también textoSecundario sobre acentoSuave antes de usarlo en la cifra destacada.

### Tipografía

Fuente del sistema: SF Pro / Roboto / sans-serif. Hero 48, título 32, sección 22, cuerpo 16, etiqueta 14, ayuda 12, dato 44. Dato y títulos admiten peso fuerte; cuerpo mantiene altura de línea legible. No fijar una altura de texto que corte el escalado del sistema. Los números grandes no sustituyen su etiqueta accesible.

### Espacio, forma y medidas

Escala: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Radios: control 14, tarjeta 20, destacada 24 y pastilla 999. Alto mínimo táctil 44; botón habitual 48. Poster ilustrativo de la destacada: 88 × 132, radio 12. El contenido de una pantalla puede desplazarse y la barra inferior respeta el área segura.

Las dimensiones funcionales ya existentes de póster/listas/íconos se conservan como tokens de compatibilidad identificados en src/tema; no se mezclan con la escala de espacios. Los cocientes de aspecto, bordes de una unidad, anchos porcentuales y cálculos proporcionales de barras son medidas estructurales, no nuevos colores o tamaños tipográficos.

## Componentes

### Conservados de P3

- Tarjeta de obra: póster con reemplazo, título, tipo/año y estado escrito; botón accesible completo.
- Selector de estado: Por ver / Viendo / Vista, etiqueta además del color, controles ≥44.
- Estrellas: cinco controles accesibles, habilitados solo en Vista, opción quitar calificación.
- Botón: principal lavanda, secundario tonal, destructivo rosa con confirmación independiente.
- Aviso: texto de causa/acción, variante de error y modo offline, sin promesas de datos completos.

### Nuevos

- TarjetaDato: etiqueta, cifra y contexto; total de obras desglosa películas/series; horas aclara Solo películas.
- Preferencia: género/director, nombre y número de obras; vacío informativo si faltan datos.
- BarrasMes: doce View proporcionadas al máximo del año, ceros visibles como base mínima; etiquetas de mes y cantidad, mes top destacado con texto. Sin librería de gráficos.
- ObraDestacada: póster o reemplazo, título, estrellas personales, acción Ver mi entrada. Sin calificadas: invitar a calificar.
- SelectorAnio: solo opciones D4, selección accesible, valor visible y área táctil ≥44; no introducir años vacíos arbitrarios.
- EstadoPantalla: carga, preparación con avance, vacío, error/reintento, copia offline y datos parciales.

## Pantallas

Mi año en cine entra como cuarta pestaña: Buscar / Mi lista / Mi año / Acerca de. La cabecera presenta año actual inicial y texto Cada historia deja una huella. Jerarquía: totales y horas → preferencias → meses → destacada. Se puede desplazar el contenido; la barra de navegación queda accesible. El vacío conserva selector y ofrece Ir a Mi lista. La obra destacada abre la entrada personal; desde allí puede verse la ficha TMDB.

Las pantallas anteriores conservan sus funciones y migran a los tokens. Acerca de conserva marca oficial y aviso literal de TMDB. El SVG oficial no se redibuja: sus datos de marca pueden alojarse en src/tema para no introducir literales hex fuera de la fuente permitida.

## Voz

Cercana, breve y concreta. Vacío: Tu año todavía tiene historias por descubrir. Error: No pudimos actualizar tu resumen. Conservamos tu última copia (solo si realmente existe una copia). Sin copia: explicar el fallo y Reintentar. Parcial: informar la cantidad de obras pendientes y que siguen contando en el total. Evitar mensajes técnicos al usuario final.

## Accesibilidad

Texto ≥4,5:1, foco visible, etiquetas para estrellas/selector/barras, controles ≥44. No usar solo color para transmitir estado o mes top. Mantener escalado de texto, ScrollView para alturas pequeñas y botones sin depender de gestos ocultos. Evitar animación necesaria para entender datos; respetar reducción de movimiento si se añade alguna.

## Sí y no

| Sí                             | No                                                 |
| ------------------------------ | -------------------------------------------------- |
| Cifras con etiqueta y contexto | Números aislados o horas de series inventadas      |
| Tonos del inventario aprobado  | Nuevos hex en pantallas o componentes              |
| Mensaje de datos incompletos   | Mostrar cero como si la carga hubiera tenido éxito |
| Póster con reemplazo accesible | Romper la tarjeta si falta una imagen              |
| Barras View con texto          | Librerías de gráficas o datos solo por color       |
| Cambios de diseño revisados    | Alterar este documento unilateralmente             |

## Decisiones pendientes

No hay cambios de paleta pendientes. Las propuestas PA-01–PA-05 del PRD son puntos de comportamiento/proceso para consulta, no autorización para alterar la marca. Las pruebas humanas y la ejecución dentro de Claude Code se acreditan por separado.
