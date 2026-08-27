# Cristian Alexis Roman Santiago — QA Engineer Portfolio

Portfolio profesional bilingüe orientado a recruiters y hiring managers de tecnología. Presenta experiencia verificable, habilidades de Quality Assurance, proyectos públicos y medios de contacto en una interfaz rápida, accesible y responsive.

## Stack y arquitectura

- **Frontend:** React 19, TypeScript y Vite.
- **Backend/API:** Node.js 22 y Express 5.
- **Datos:** libSQL. En desarrollo usa un archivo SQLite local; en producción puede conectarse a Turso mediante HTTPS.
- **Validación:** Zod en todos los payloads públicos.
- **Pruebas:** Vitest y Testing Library.
- **Deploy recomendado:** Vercel para frontend y función Express; Turso para persistencia de analytics.

La aplicación mantiene una sola unidad desplegable. El frontend envía eventos mínimos a la API; la API valida, reduce el User-Agent a categorías generales y guarda datos agregables en libSQL. El dashboard consulta la misma API mediante una cookie de sesión firmada.

```text
Recruiter ──> React portfolio ──> POST /api/events ──> libSQL/Turso
                                      │
Owner ──> /private-insights ──> signed HttpOnly session
                                      │
                                      ├──> aggregated metrics
                                      └──> Excel-compatible CSV
```

No hay microservicios, CMS ni dependencias de UI innecesarias.

## Ejecución local

Requisitos:

- Node.js 22 o superior.
- npm 10 o superior.

```bash
npm install
copy .env.example .env
npm run dev
```

El frontend estará en `http://localhost:5173` y la API en `http://localhost:3001`. Vite reenvía `/api` al servidor local.

Las variables `.env` no se cargan automáticamente por diseño. Para ejecutar la API localmente, expórtalas desde la terminal o usa `vercel dev`, que puede cargar la configuración vinculada del proyecto. Nunca confirmes `.env` al repositorio.

## Comandos de calidad

```bash
npm run lint
npm test
npm run build
npm audit
npm run preview
```

El build crea `dist/`, además de generar `robots.txt` y `sitemap.xml` con `SITE_URL`.

## Organización

```text
api/
  index.ts                 API, analytics, autenticación y CSV
  lib/security.ts          sesiones, hashing, cookies y parsing seguro
public/
  resume/                  CV público descargable
  favicon.svg
  social-card.svg
scripts/
  dev.mjs                  frontend y API en desarrollo
  generate-seo.mjs         robots y sitemap según el dominio
src/
  components/              controles e iconografía
  data/profile.ts          única fuente de datos profesionales y textos
  hooks/useAnalytics.ts    eventos first-party y respeto a DNT
  pages/Portfolio.tsx      sitio público
  pages/Dashboard.tsx      panel privado
  styles.css               sistema visual, temas y responsive
```

## Actualizar información profesional

Toda la información pública se centraliza en `src/data/profile.ts`.

### Experiencia

Edita `profile.experience`. Cada entrada incluye empresa, puesto bilingüe, periodo, responsabilidades bilingües y entorno técnico. No añadas métricas o logros que no puedas demostrar.

### Skills

Edita `profile.skills`. Las habilidades se agrupan por práctica; el diseño no utiliza porcentajes ni niveles artificiales.

### Proyectos

Edita `profile.projects`. Publica únicamente repositorios existentes. Cada proyecto necesita descripción en ambos idiomas, tecnologías verificadas y URL directa.

### LinkedIn, GitHub y contacto

Edita `linkedin`, `github`, `email`, `phoneDisplay`, `phoneHref` y `whatsapp` dentro de `profile`. El enlace de WhatsApp debe conservar el formato internacional sin `+`, espacios ni guiones.

## Fotografía profesional

La fotografía optimizada está en `public/profile.webp` y se utiliza tanto en el Hero como en las dos versiones del CV. Conserva la imagen proporcionada, sin generación ni alteración de facciones mediante IA.

Para reemplazarla, optimiza la nueva fotografía a WebP, conserva el nombre `profile.webp` y comprueba el encuadre en desktop, móvil y PDF.

## CV

Los CV descargables están en:

- Inglés: `public/resume/Cristian-Alexis-Roman-Santiago-QA-Engineer.pdf`.
- Español: `public/resume/Cristian-Alexis-Roman-Santiago-QA-Engineer-ES.pdf`.

El selector de idioma determina qué versión descarga el recruiter. Para regenerarlos después de actualizar la experiencia, ejecuta `python scripts/generate_resume.py` con ReportLab disponible.

## Idiomas y temas

- La primera visita usa el idioma del navegador (`es` o `en`).
- La preferencia se guarda como `portfolio-language`.
- El tema inicial respeta `prefers-color-scheme`.
- La preferencia se guarda como `portfolio-theme`.
- Ambos selectores actualizan etiquetas accesibles y todo el contenido público.
- Las animaciones se desactivan con `prefers-reduced-motion`.

## Analytics respetuoso de privacidad

Eventos implementados:

- `page_view`
- `view_experience`
- `view_projects`
- `linkedin_click`
- `github_click`
- `resume_download`
- `contact_click`

El sistema no guarda IP completa, query strings del referrer, contenido de contacto ni fingerprint. El servidor asigna un identificador aleatorio mediante cookie `HttpOnly`, guarda únicamente un HMAC irreversible de ese valor y lo usa para distinguir visitas nuevas y recurrentes. `Do Not Track: 1` deshabilita la captura. La retención predeterminada es de 90 días.

Para desactivar analytics:

```env
ANALYTICS_ENABLED=false
VITE_ANALYTICS_ENABLED=false
```

La variable del servidor es autoritativa.

## Dashboard privado

Ruta local y de producción:

`/private-insights`

No está enlazada desde el sitio, se excluye de robots/sitemap y responde con `noindex`. La ruta no es el control de seguridad: todos los datos requieren una sesión firmada creada después de validar `ADMIN_PASSWORD`.

Configura secretos diferentes y largos:

```env
ADMIN_PASSWORD=una-contraseña-larga-y-única
SESSION_SECRET=un-secreto-aleatorio-de-al-menos-32-caracteres
ANALYTICS_HASH_SECRET=otro-secreto-aleatorio-independiente
```

En desarrollo, copia estos valores en `.env.local`; `npm run dev` carga ese
archivo automáticamente. `.env.local` está excluido de Git para no publicar
las credenciales.

La sesión dura una hora y utiliza `HttpOnly`, `Secure` en producción y `SameSite=Strict`.

GitHub Pages publica únicamente la versión estática del portafolio. El workflow
de Pages desactiva analytics porque GitHub Pages no ejecuta la API de Node. Para
usar el dashboard en producción, despliega el proyecto completo en un servicio
compatible con funciones de servidor y configura Turso.

### Exportación CSV

Después de iniciar sesión, selecciona **Exportar CSV**. El endpoint `/api/admin/export.csv` entrega UTF-8 con BOM, comillas seguras y terminación CRLF para compatibilidad con Excel. La exportación no incluye el hash del visitante.

## Base de datos y retención

Desarrollo:

```env
TURSO_DATABASE_URL=file:./data/analytics.db
TURSO_AUTH_TOKEN=
```

Producción:

```env
TURSO_DATABASE_URL=libsql://tu-base-de-datos.turso.io
TURSO_AUTH_TOKEN=tu-token-servidor
```

La tabla se crea automáticamente. Cada nuevo evento elimina registros anteriores a `ANALYTICS_RETENTION_DAYS`. Para borrar todos los analytics, elimina las filas de `analytics_events` desde Turso o elimina el archivo local con la API detenida.

## SEO

Incluye HTML semántico, jerarquía de headings, title, meta description, canonical, Open Graph, Twitter Card, JSON-LD `Person`, `robots.txt`, `sitemap.xml`, social card y datos de contacto limitados a la sección pública correspondiente.

Antes del build de producción define:

```env
SITE_URL=https://tu-dominio.com
```

Así el canonical, Open Graph, robots y sitemap apuntarán al dominio real. La ruta privada nunca se incluye en el sitemap.

## Deployment en Vercel

1. Crea una base libSQL/Turso y conserva su URL y token.
2. Importa este repositorio en Vercel.
3. Usa `npm run build` como build command y `dist` como output directory si Vercel no los detecta.
4. Configura todas las variables de `.env.example` para Production y Preview.
5. Define `SITE_URL` con el dominio definitivo y agrega también el dominio de preview permitido si necesitas probar APIs desde otra procedencia.
6. Despliega primero como Preview.
7. Comprueba portfolio, `/api/health`, captura de eventos, login, métricas y CSV.
8. Promueve el deployment a Production.

Vercel ejecuta `api/index.ts` como función Node. La regla de rewrite conserva las rutas Express bajo `/api/*`. Los datos persistentes deben usar Turso; el filesystem de una función no es almacenamiento permanente.

## Headers y seguridad

`vercel.json` aplica CSP, HSTS, protección contra framing, MIME sniffing, referrer leakage y acceso a cámara, micrófono, geolocalización, pagos y USB. La API añade los mismos principios, CORS restringido, límite de 4 KB, validación por schema, métodos cerrados, rate limiting y errores sin stack trace para el cliente.

Consulta `SECURITY.md` para el modelo de amenazas, revisión realizada y riesgos conocidos.
