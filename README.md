# Clip Machine — prototipo mejorado

Web móvil en español, pensada para abrirse desde Safari en iPhone. Conserva la estructura y el diseño del prototipo original.

## Funciones disponibles en esta versión
- Carga de archivos de vídeo locales desde el dispositivo.
- Selección manual del rango de inicio y final.
- Vista previa con formatos vertical, horizontal, pantalla dividida y foto + vídeo (la segunda fuente/foto sigue siendo un espacio de composición).
- Personalización de subtítulos: texto, tipografía, tamaño, color, fondo y posición.
- Zoom y encuadre.
- Exportación local experimental del rango seleccionado mediante Canvas y MediaRecorder. Según el navegador, puede generar MP4 o WebM; la compatibilidad de audio/códecs depende del dispositivo.
- Selector explícito de modo stream en vivo y modo VOD terminado, con indicación transparente del estado de las integraciones.

## Aún requiere desarrollo e infraestructura
- Conectores reales para Kick, Twitch y YouTube.
- Ingestión/segmentación de directos en vivo y captura de los momentos anteriores y posteriores al disparador.
- Análisis automático real con IA y transcripción.
- Análisis de VOD y selección automática de mejores momentos.
- Segunda fuente real para layouts divididos y carga de imagen para foto + vídeo.
- Renderizado profesional/estable en servidor, almacenamiento, usuarios e historial.

## Probar
Publica el contenido de esta carpeta en un hosting HTTPS. En iPhone abre la URL en Safari. Carga un vídeo local, define Desde/Hasta y pulsa Exportar clip. Mantén Safari abierto durante el renderizado. Prueba primero con un vídeo corto.

## Seguridad y compatibilidad
No se deben poner claves API en el frontend. La conexión a plataformas y los trabajos de IA deben pasar por un backend con credenciales protegidas y respetar las APIs, permisos, derechos y condiciones de cada plataforma. La exportación en navegador es experimental y está limitada por la memoria y las capacidades del dispositivo.


## Importar enlaces públicos (integración inicial)
- Kick: admite el reproductor oficial para enlaces de canal en vivo `kick.com/usuario`.
- Twitch: admite el reproductor oficial para canales y VODs. Twitch exige el parámetro `parent` con el dominio donde se publica la página.
- YouTube: admite el reproductor oficial para vídeos y directos con ID de vídeo.

**Limitación importante:** la integración actual incrusta el reproductor para visualizar el contenido; no extrae el flujo de vídeo ni permite todavía recortar/exportar directamente desde el iframe. Los reproductores externos están aislados por el navegador y las políticas de cada plataforma. Para generar clips remotos, clips en tiempo real y análisis automático de VOD hace falta un backend propio, APIs/credenciales cuando correspondan y un sistema de procesamiento autorizado. La exportación local sigue funcionando con archivos de vídeo cargados desde el dispositivo.
