# Crear un proyecto nuevo desde la base

1. **Copiar la base** a un repo nuevo (sin historial):

   ```bash
   git clone --depth 1 <repo-genesis> mi-negocio && cd mi-negocio
   rm -rf .git && git init -b main
   pnpm install
   ```

2. **Datos del negocio** — `src/config/site.ts`:
   - `url`: dominio definitivo, sin barra final. Es la única fuente del dominio.
   - `entity.schemaType`: `Organization`, `LocalBusiness` o un subtipo de schema.org (`Restaurant`, `Dentist`, `LegalService`, `Store`…). `entity.local: true` si hay local físico (emite dirección, geo, horarios y `priceRange`).
   - Contacto, dirección, `geo`, `openingHours`, redes (vacías = se omiten) y `aiTraining`.
3. **Idiomas** — `src/i18n/config.ts`:
   - Quitar un idioma: borrar su entrada en `locales`, su diccionario en `src/i18n/ui/` (y en `ui/index.ts`), su columna en `routes.ts` y su carpeta en cada `src/content/*/`.
   - Añadir un idioma: entrada en `locales`, `src/i18n/ui/<lang>.ts` tipado `Record<UiKey, string>`, registrarlo en `ui/index.ts`, slugs en `routes.ts` y carpeta `<lang>/` en cada colección.
   - TypeScript falla si falta alguna pieza.
4. **Textos** — `src/i18n/ui/*.ts`. Títulos de 30–60 caracteres y descripciones de 120–160 (`pnpm check:i18n` avisa).
5. **Contenido** — `src/content/`:
   - Nombre de fichero = slug de la URL (kebab-case, minúsculas).
   - Misma `translationKey` en todas las traducciones de una entrada (así se enlazan los `hreflang` y el sitemap).
   - `summary` de servicios: 40–60 palabras, factual y autocontenido (es lo que citan los buscadores de IA).
   - `draft: true` oculta la entrada en producción (páginas, sitemap, RSS y `llms.txt`).
   - Revisar las plantillas legales con un asesor.
6. **Marca visual** — `src/styles/tokens.css` (colores semánticos, tipografía, radios…) y la fuente en `astro.config.ts` (`fonts`). Mantener contraste ≥ 4,5:1.
7. **Imágenes** — sustituir `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png` (180×180), `public/logo.png` (cuadrado ≥ 112 px), `public/og-default.jpg` (1200×630) y `src/assets/hero.jpg`. `pnpm tsx scripts/generate-placeholders.ts` regenera los genéricos.
8. **Variables de entorno** — copiar `.env.example` a `.env`:
   - `PUBLIC_GA_ID` (vacío = sin analítica ni banner de cookies).
   - `PUBLIC_CONTACT_ENDPOINT` (vacío = sin formulario) y `CONTACT_ORIGIN` (origen del endpoint para la CSP de Nginx).
9. **Redirecciones** de URLs antiguas — `src/config/redirects.ts`.
10. **Comprobar** — `pnpm check && pnpm build && pnpm verify`.
11. **Desplegar** — `docker compose up -d --build` en el servidor, detrás del proxy/TLS que se configure a mano. Activar HSTS en `deploy/nginx/default.conf.template` solo cuando HTTPS funcione.
12. Seguir [el checklist de lanzamiento](launch-checklist.md).
