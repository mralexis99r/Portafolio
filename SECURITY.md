# Security notes

## Controles implementados

- Validación estricta con Zod para eventos y login.
- Payload JSON limitado a 4 KB.
- CORS limitado a `SITE_URL` y al hostname del deployment actual de Vercel.
- Métodos y endpoints no definidos responden `405`.
- Sesiones firmadas mediante HMAC-SHA256.
- Cookies `HttpOnly`, `SameSite` y `Secure` en producción.
- Comparación de credenciales mediante hashes de longitud constante.
- Rate limiting para eventos y autenticación.
- CSP sin `unsafe-inline`, HSTS, `nosniff`, `frame-ancestors`, referrer y permissions policy.
- Secretos únicamente en variables de entorno.
- Consultas parametrizadas con libSQL.
- Identificadores de analytics pseudónimos mediante HMAC.
- Sin IP completa, fingerprinting, query strings del referrer ni datos del contacto.
- Respuestas de error genéricas; el stack no se envía al cliente.
- Dashboard y exportación protegidos por la misma sesión de administrador.
- Retención configurable y eliminación automática de datos antiguos.

## Revisión realizada

- Auditoría npm de dependencias de producción y desarrollo.
- Búsqueda de patrones comunes de secretos en archivos versionables.
- Revisión de variables públicas `VITE_*`.
- Pruebas de sesión firmada, manipulación de token y hashing del visitante.
- Prueba real de `401` antes del login.
- Prueba real de login, métricas y descarga CSV autenticada.
- Revisión de CORS, métodos, payloads, cookies y errores.
- Revisión básica de XSS: React escapa el contenido y no se usa `dangerouslySetInnerHTML`.

## Riesgos conocidos

- El rate limiting vive en memoria y se reinicia cuando una función serverless cambia de instancia. Para tráfico hostil sostenido, complementarlo con Vercel Firewall o un contador distribuido.
- La autenticación usa una sola contraseña y no incluye MFA. Es adecuada para un panel personal de bajo riesgo, pero debe migrarse a un proveedor de identidad si aumenta el alcance.
- El país y región dependen de headers de Vercel; en local quedan vacíos. No se obtiene geolocalización desde una IP almacenada.
- La seguridad de analytics depende también de los permisos y rotación del token Turso.
- El CSP debe probarse nuevamente si se incorporan scripts, imágenes o fuentes de terceros.
- Ninguna revisión garantiza seguridad absoluta. Actualiza dependencias y repite `npm audit` antes de cada release importante.

## Reporte y respuesta

No publiques secretos ni datos de analytics en un issue público. Rota inmediatamente `ADMIN_PASSWORD`, `SESSION_SECRET`, `ANALYTICS_HASH_SECRET` y `TURSO_AUTH_TOKEN` si sospechas exposición.
