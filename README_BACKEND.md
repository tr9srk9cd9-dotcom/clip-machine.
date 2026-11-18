# Clip Machine — backend inicial (v0.1)

Este es un primer backend ejecutable para Render mediante Docker. Incluye:
- `GET /health`: comprobación de disponibilidad.
- `GET /api/status`: capacidades reales y funciones aún no conectadas.
- `POST /api/clips/trim`: recibe un vídeo propio mediante multipart (`video`, `start`, `end`) y genera un MP4 con FFmpeg. Rango máximo: 10 minutos.

## Despliegue en Render
1. Sube esta carpeta `backend` al repositorio GitHub `clip-machine.` (o el nombre exacto que tenga).
2. En Render: New + → Web Service → conecta el repositorio.
3. En **Root Directory**, escribe `backend`.
4. En **Runtime**, selecciona **Docker**. Render detectará `Dockerfile`.
5. No hace falta configurar Build Command ni Start Command.
6. Crea el servicio. Cuando esté activo, abre `https://TU-SERVICIO.onrender.com/health` y comprueba que devuelve `{"ok":true,...}`.

## Límites y siguientes pasos
- Este backend todavía NO descarga ni ingiere streams de Kick/Twitch/YouTube.
- Todavía NO hace análisis IA, subtítulos automáticos, recorte automático de VOD ni clipping en vivo.
- El endpoint de recorte trabaja con archivos que el usuario tiene derecho a procesar y sube directamente; no extrae contenido de iframes.
- El almacenamiento temporal se borra después de enviar el MP4. Render puede reiniciar instancias; no usar almacenamiento local como biblioteca permanente.
- Para producción se necesita almacenamiento de objetos, autenticación, límites de uso, cola de trabajos y protección adicional.
- No subir claves API ni archivos `.env` a GitHub. Configurar secretos desde Render Environment.
