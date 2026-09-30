# Base de conocimiento — Genesis Web Base

> Por qué la plantilla está hecha así. Generalizada a partir de un proyecto anterior (portfolio bilingüe en Astro, archivado en `docs/archive/web-base-knowledge.md`) y adaptada a **cualquier tipo de negocio**.
> Cada sección enlaza con el fichero donde vive la decisión.

## Índice

1. [Stack](#1-stack)
2. [Estructura](#2-estructura)
3. [Layout y `<head>`](#3-layout-y-head)
4. [Internacionalización](#4-internacionalización)
5. [HTML semántico](#5-html-semántico)
6. [Sistema de diseño](#6-sistema-de-diseño)
7. [Responsive](#7-responsive)
8. [Imágenes y rendimiento](#8-imágenes-y-rendimiento)
9. [SEO técnico](#9-seo-técnico)
10. [Datos estructurados (JSON-LD)](#10-datos-estructurados-json-ld)
11. [GEO — buscadores de IA](#11-geo--buscadores-de-ia)
12. [Accesibilidad](#12-accesibilidad)
13. [Analítica y consentimiento](#13-analítica-y-consentimiento)
14. [Seguridad y despliegue](#14-seguridad-y-despliegue)
15. [Lecciones aprendidas](#15-lecciones-aprendidas)
16. [Checklist](#16-checklist)
17. [Cómo extender la base](#17-cómo-extender-la-base)

---

## 1. Stack

| Pieza         | Elección                                         | Motivo                                                                   |
| ------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| Framework     | Astro 7, salida estática                         | HTML puro, 0 KB de JS por defecto; ideal para SEO, GEO y Core Web Vitals |
| Gestor        | pnpm 11, versión fijada en `packageManager`      | Lockfile determinista y controles de cadena de suministro                |
| Node          | `>=22.12.0` (`engines`)                          | Requisito de Astro 7                                                     |
| TypeScript    | 6, `astro/tsconfigs/strict`                      | `@astrojs/check` aún no soporta TS 7                                     |
| Estilos       | CSS propio con custom properties                 | Control total, sin dependencias                                          |
| Fuentes       | Fonts API de Astro (Inter vía fontsource)        | Self-hosted, preload y métricas de fallback automáticas                  |
| Imágenes      | `astro:assets` + sharp                           | AVIF/WebP y `srcset` automáticos                                         |
| Integraciones | `@astrojs/sitemap`, `@astrojs/rss`               | Sitemap y feeds generados                                                |
| Tests         | Vitest                                           | Lógica pura en `src/lib/` y `scripts/lib/`                               |
| Despliegue    | Docker (`node:22-alpine` → `nginx-unprivileged`) | Servidor propio, portable                                                |

### Seguridad de dependencias (`pnpm-workspace.yaml`)

| Ajuste                            | Qué hace                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| `engineStrict: true`              | No instala si la versión de Node no cumple `engines`                                          |
| `minimumReleaseAge: 1440`         | No instala versiones publicadas hace menos de 24 h (ventana típica de paquetes comprometidos) |
| `trustPolicy: no-downgrade`       | Falla si una versión tiene menos garantías (provenance) que las anteriores                    |
| `trustPolicyExclude`              | Excepciones revisadas a mano, siempre con versión exacta y comentario                         |
| `blockExoticSubdeps: true`        | Las dependencias transitivas no pueden venir de git ni de tarballs                            |
| `strictDepBuilds` + `allowBuilds` | Solo `esbuild` y `sharp` pueden ejecutar scripts de instalación                               |

Al actualizar dependencias, revisar si las excepciones de `trustPolicyExclude` siguen siendo necesarias.

### Particularidades de Astro 7

- El compilador (Rust) rechaza HTML mal cerrado: cerrar siempre `<textarea></textarea>`, `<p></p>`, etc.
- `compressHTML: 'jsx'`: los saltos de línea entre elementos inline se eliminan. Si hace falta un espacio entre un texto y un elemento en líneas distintas, usar `{' '}`.
- Markdown se procesa con Sätteri por defecto.

---

## 2. Estructura

```
src/
├── config/        site.ts (negocio), nav.ts (menú), redirects.ts (301)
├── i18n/          config.ts (idiomas), routes.ts (slugs), ui/*.ts (textos), utils.ts
├── content/       services/ blog/ faq/ legal/ → <lang>/<slug>.(md|yaml)
├── content.config.ts   schemas zod de las colecciones
├── lib/           lógica pura y testeada (seo, schema, pages, robots, llms, consent…)
├── layouts/       BaseLayout.astro
├── components/    seo/ layout/ ui/ blocks/ consent/
├── views/         una vista por tipo de página
├── pages/         [...path].astro (todas las páginas), 404, robots, llms, rss
├── styles/        tokens.css, base.css, utilities.css
└── assets/        imágenes procesadas
```

**Principios**

- **Fuente única por dato.** Dominio solo en `SITE.url`; slugs solo en `routes.ts` y nombres de fichero; textos solo en los diccionarios. Todo lo demás (canonical, hreflang, schema, sitemap, `llms.txt`, redirects de Nginx) se deriva.
- **Una sola ruta dinámica.** `src/pages/[...path].astro` recibe la lista de páginas de `planPages()` (`src/lib/pages.ts`), una función pura y testeada. Añadir un idioma no crea ficheros de página nuevos.
- **Vista = composición de bloques.** Las vistas (`src/views/`) montan `BaseLayout` y bloques; la lógica vive en `src/lib/`.
- **Nunca propiedades vacías.** `compact()` limpia el JSON-LD; los componentes omiten lo que no está configurado.

---

## 3. Layout y `<head>`

`BaseLayout.astro` recibe `lang`, `path`, `title`, `description`, `alternates` y, opcionalmente, `schema`, `ogImage`, `ogType`, `noindex`, fechas e `isHome`.

Orden del `<head>` (`src/components/seo/Seo.astro`):

1. `charset`, `viewport`
2. `<title>`, `description`, `robots` (`index, follow` o `noindex, follow`)
3. `canonical` absoluto (sin barra final salvo `/`)
4. `hreflang` de cada versión + `x-default` (solo si hay 2+ versiones)
5. Open Graph: `type`, `site_name`, `url`, `title`, `description`, `locale`, `locale:alternate`, `image` + dimensiones + `alt`, fechas de artículo
6. Twitter Card `summary_large_image`
7. Iconos (`favicon.svg`, `favicon.ico`, `apple-touch-icon`) y `theme-color`
8. `alternate` al RSS del idioma
9. Script inline `no-js → js`, fuente precargada y JSON-LD

**Reglas de contenido**

- Title: 30–60 caracteres. En la home, `Marca — propuesta`; en el resto se añade `— Marca` automáticamente (`pageTitle()`).
- Description: 120–160 caracteres, con keyword, propuesta de valor y CTA suave.
- `pnpm check:i18n` avisa de longitudes fuera de rango.

---

## 4. Internacionalización

- **Idiomas** en `src/i18n/config.ts` (`locales`, `defaultLocale`). El idioma por defecto va sin prefijo (`/`, `/servicios`); el resto con prefijo (`/en`, `/en/services`).
- **Textos** en `src/i18n/ui/<lang>.ts`. `es.ts` define `UiKey`; los demás son `Record<UiKey, string>`, así que **TypeScript falla si falta o sobra una traducción**.
- **Slugs traducidos** en `src/i18n/routes.ts`. `localizePath(routeKey, lang, slug?)` construye todas las URLs.
- **Contenido**: la carpeta es el idioma y el nombre de fichero es el slug (`services/es/consultoria.md` → `/servicios/consultoria`). Las traducciones se enlazan con la misma `translationKey`.
- **hreflang** solo cuando hay 2+ versiones de la página; `x-default` apunta al idioma por defecto. Contenido que solo existe en un idioma no emite hreflang.
- **Selector de idioma**: enlaza a la página equivalente; si no existe traducción, a la home de ese idioma. Con un solo idioma configurado no se muestra.
- **Comprobaciones** (`pnpm check:i18n`): claves duplicadas en diccionarios (error: JS se queda en silencio con la última), nombres de fichero (error), paridad de traducciones y longitudes SEO (avisos).

---

## 5. HTML semántico

- Landmarks hermanos: `<header>` (cabecera) → `<main id="main">` → `<footer>`.
- **Un solo `<h1>`** por página (hero o cabecera de página); `<h2>` por sección y `<h3>` en tarjetas y preguntas. `pnpm verify` lo comprueba en el build.
- Secciones con `aria-labelledby` apuntando a su encabezado (visible o `.visually-hidden`).
- Breadcrumbs visibles en `<nav aria-label>` con `<ol>` y `aria-current="page"`.
- FAQ con `<details>/<summary>`: funciona sin JS y el texto está en el HTML.
- Datos de contacto en `<address>` + `<dl>`; fechas con `<time datetime>`.

---

## 6. Sistema de diseño

`src/styles/tokens.css` es el **único fichero que se toca para cambiar de marca**.

- **Primitivos** (`--white`, `--black`, `--gray-50…900`, `--red-50…900`) → **semánticos** (`--color-bg`, `--color-text`, `--color-text-muted`, `--color-link`, `--color-accent`, `--color-border-strong`, `--color-focus`, estados…). Los componentes solo usan semánticos.
- Paleta base: blanco, negro, grises y rojo (`--red-700`, 6,5:1 sobre blanco) para enlaces y acento. Todos los pares de texto ≥ 4,5:1; bordes de formulario ≥ 3:1.
- Tipografía fluida `--step--1 … --step-5` con `clamp()`; pesos `--fw-*`; interlineado `--lh-*`; medida de lectura `--measure: 65ch`.
- Espaciado fluido `--space-3xs … --space-3xl`; contenedores `--container-max` / `--container-narrow`; radios, sombras, duraciones, easing, capas (`--z-*`) y controles (`--control-height: 44px`).
- `base.css`: reset, tipografía, enlaces, formularios, `:focus-visible`, skip-link, reveal y `prefers-reduced-motion`.
- `utilities.css`: `.container`, `.section-pad`, `.stack`, `.cluster`, `.grid-auto`, `.visually-hidden`, `.lead`, `.eyebrow`, `.prose`, `.btn*`, `.link-button`.
- Estilos de cada componente en su `<style>` _scoped_.

---

## 7. Responsive

- **Mobile-first**: estilo base en una columna y ampliaciones con `min-width`.
- **Solo tres breakpoints**: `600px` (sm), `900px` (md: menú de escritorio, hero en dos columnas) y `1200px` (lg).
- Grids con `repeat(auto-fill, minmax(min(100%, 18rem), 1fr))`: se adaptan sin breakpoints.
- Tarjetas con **container queries**.
- `100svh` en lugar de `100vh`. CTAs a ancho completo por debajo de 600 px.
- Probar siempre a 320, 375, 768, 1024 y 1440 px, sin scroll horizontal.

---

## 8. Imágenes y rendimiento

- `<Picture>` de `astro:assets` con AVIF/WebP, `widths` y `sizes`. Todas las imágenes llevan `width`, `height` y `alt`.
- Imagen LCP (hero): `loading="eager"` y `fetchpriority="high"`; el resto, lazy.
- Una familia tipográfica (Inter, 4 pesos, subset latin), self-hosted con preload.
- JS mínimo y vanilla: menú, reveal, banner de cookies, analítica y formulario.
- Iconos SVG inline (`Icon.astro`), sin librerías ni peticiones extra.
- Objetivos: LCP < 2,5 s, INP < 200 ms, CLS < 0,1; Lighthouse móvil ≥ 90 en las cuatro categorías.

---

## 9. SEO técnico

- `trailingSlash: 'never'` + `build.format: 'file'` → `/servicios` se genera como `servicios.html`. Canonical sin barra final; Nginx redirige `/x/` → `/x` con 301.
- **Sitemap** (`astro.config.ts`): excluye `/404` y páginas `noindex`, añade `lastmod` desde `updated`/`published` y los alternates hreflang de cada grupo de traducciones. La opción `i18n` de la integración no sirve con slugs traducidos (solo empareja rutas idénticas), por eso los alternates salen de `collectContentMeta()`.
- **Redirecciones 301** en `src/config/redirects.ts` → `deploy/nginx/redirects.conf` en cada build. Nunca `meta refresh`.
- **404** propia con enlaces a las secciones principales y a la home de cada idioma.
- **Una página por servicio**: más superficie para búsquedas long-tail y URLs citables.
- Legales: aviso legal y cookies con `noindex, follow`; privacidad indexable.

---

## 10. Datos estructurados (JSON-LD)

Un único `<script type="application/ld+json">` por página con un `@graph` y `@id` estables (`src/lib/schema.ts`):

| Página          | Nodos                                                                             |
| --------------- | --------------------------------------------------------------------------------- |
| Todas           | `WebSite` (`/#website`) + entidad del negocio (`/#organization`)                  |
| Home            | `WebPage` + `FAQPage` (si hay FAQ)                                                |
| Servicios       | `CollectionPage` + `BreadcrumbList`                                               |
| Servicio        | `WebPage` + `BreadcrumbList` + `Service` (`provider → #organization`) + `FAQPage` |
| Sobre nosotros  | `AboutPage` + `BreadcrumbList`                                                    |
| Contacto        | `ContactPage` + `BreadcrumbList`                                                  |
| FAQ             | `FAQPage` (con `mainEntity`) + `BreadcrumbList`                                   |
| Blog / artículo | `CollectionPage` / `WebPage` + `BlogPosting` + `BreadcrumbList`                   |
| Legales         | `WebPage` + `BreadcrumbList`                                                      |

**Entidad configurable** (`SITE.entity`): `schemaType` puede ser `Organization`, `LocalBusiness` o un subtipo (`Restaurant`, `Dentist`, `LegalService`…). Con `local: true` se emiten `address`, `geo`, `openingHoursSpecification`, `priceRange` y `areaServed`.

**Reglas**

- Los textos del schema salen del mismo diccionario o contenido que el texto visible.
- URLs siempre absolutas y del idioma de la página.
- `compact()` elimina propiedades vacías; nunca se emite `""`, `[]` ni `{}`.
- Validar con Rich Results Test y validator.schema.org antes de publicar.

---

## 11. GEO — buscadores de IA

GEO = que ChatGPT, Perplexity, Claude, Google AI Overviews o Copilot **entiendan, citen y recomienden** el negocio.

- **`robots.txt`** (`src/lib/robots.ts`), generado desde `SITE`:
  - Bots de búsqueda y citación **siempre permitidos**: `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`, `Claude-SearchBot`, `Claude-User`, `Bingbot`, `Applebot`, `DuckAssistBot`.
  - Bots de entrenamiento según `SITE.aiTraining`: `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Meta-ExternalAgent`.
- **`llms.txt`** (`src/pages/llms.txt.ts`), generado en cada build: descripción factual, datos del negocio, servicios con URL y resumen, FAQ, artículos recientes, contacto y otros idiomas. Nunca se desactualiza.
- **Contenido citable**:
  - Cada servicio abre con un `summary` de 40–60 palabras que funciona solo («La consultoría es…»).
  - Bloques pregunta → respuesta (FAQ) en home, servicios y página de FAQ.
  - Cifras concretas (años, clientes, plazos).
  - Fechas de actualización visibles.
- **Coherencia de entidad (NAP)**: nombre, dirección, teléfono y URL idénticos en la web, el schema, `llms.txt`, Google Business Profile, redes y directorios. Todo sale de `SITE`.
- **Sin dependencia de JS**: el texto está en el HTML estático; `.reveal` solo oculta si hay clase `js` en `<html>`.

---

## 12. Accesibilidad

- `lang` y `dir` en `<html>`; enlace «Saltar al contenido» a `#main`.
- `:focus-visible` con anillo de 3 px en todos los elementos interactivos.
- Menú móvil: `<button>` con `aria-expanded`, `aria-controls` y `aria-label` que cambia; se cierra con `Esc` (devolviendo el foco), al pulsar un enlace y al pasar a escritorio. Sin JS, el menú se muestra desplegado.
- `aria-current` en la navegación, breadcrumbs y selector de idioma; enlaces de idioma con `hreflang` y `lang`.
- SVG decorativos con `aria-hidden`; enlaces externos anuncian «(se abre en una pestaña nueva)».
- Formulario con `<label>` explícitos, `autocomplete`, validación nativa y estado en `role="status"` / `aria-live`.
- `prefers-reduced-motion` anula transiciones, reveal y scroll suave.
- Contraste ≥ 4,5:1 en texto y ≥ 3:1 en bordes de formulario.

---

## 13. Analítica y consentimiento

- GA4 solo se activa si `PUBLIC_GA_ID` tiene valor; sin él no hay banner ni scripts de terceros.
- **Consent Mode v2**: todo `denied` por defecto; `analytics_storage` pasa a `granted` solo al aceptar.
- **Banner propio** (`CookieBanner.astro`): no bloqueante, «Aceptar» y «Rechazar» con el mismo peso visual, enlace a la política de cookies; se reabre desde «Configurar cookies» en el pie.
- Elección guardada en `localStorage` (`consent.v1`); si el almacenamiento está bloqueado o corrupto, el banner vuelve a mostrarse sin errores.
- `gtag.js` se carga en `requestIdleCallback` para no penalizar LCP ni INP.
- **Conversiones**: cualquier elemento con `data-track="evento"` envía el evento (solo con consentimiento); el formulario envía `generate_lead`.
- **Formulario**: `PUBLIC_CONTACT_ENDPOINT` (Formspree, n8n, API propia…); funciona sin JS, con honeypot y casilla de privacidad obligatoria.

---

## 14. Seguridad y despliegue

- **Docker multi-stage**: build con pnpm (`--frozen-lockfile`) → `nginxinc/nginx-unprivileged` (usuario sin privilegios, puerto 8080).
- **docker-compose**: sistema de ficheros de solo lectura, `tmpfs` para `/tmp` y `/etc/nginx/conf.d`, healthcheck.
- **Nginx** (`deploy/nginx/default.conf.template`):
  - `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
  - CSP ajustada a GA y al origen del formulario (`CONTACT_ORIGIN`, inyectado por envsubst).
  - Caché: `/_astro/*` inmutable 1 año, HTML `no-cache`, resto 1 día.
  - `server_tokens off`, gzip, 301 sin barra final, 404 propia, include de redirects generado.
  - **HSTS comentado**: activarlo solo con HTTPS operativo en el dominio final.
- HTTPS, DNS y proxy se configuran a mano en el servidor.

---

## 15. Lecciones aprendidas

Del proyecto original (auditoría SEO inicial 58/100) se conservan las lecciones que aplican a cualquier web:

| Problema                                         | Impacto                    | Solución en la base                         |
| ------------------------------------------------ | -------------------------- | ------------------------------------------- |
| Dominio distinto en canonical y schema           | La IA ve dos entidades     | `SITE.url` como única fuente                |
| `hreflang` fijo en todas las páginas             | Alternates contradictorios | hreflang por página desde `alternates`      |
| Slugs sin traducir (`/en/servicios`)             | URL no localizada          | `routes.ts` + nombres de fichero por idioma |
| Clave i18n duplicada                             | Texto erróneo en silencio  | `check:i18n` falla con duplicados           |
| Una página por idioma copiada (~600 líneas)      | Idiomas que divergen       | Una ruta dinámica + vistas con `lang`       |
| `llms.txt` escrito a mano                        | Se queda desactualizado    | Generado en el build                        |
| Fuentes externas bloqueantes                     | Peor LCP                   | Fonts API self-hosted                       |
| Imagen principal en PNG                          | Peor LCP y más peso        | `astro:assets` → AVIF/WebP                  |
| Sin headers de seguridad                         | Auditorías suspendidas     | Nginx endurecido                            |
| Sin `prefers-reduced-motion` ni `:focus-visible` | Accesibilidad              | En `base.css`                               |
| Redirección con `meta refresh`                   | No es un 301 real          | 301 en Nginx                                |
| Sitemap i18n con slugs traducidos                | Sin alternates             | Alternates por `translationKey`             |

**Lección general:** los fallos venían de datos repetidos en varios sitios. La base tiene una fuente única para cada dato y deriva todo lo demás.

---

## 16. Checklist

Ver [`docs/launch-checklist.md`](launch-checklist.md).

---

## 17. Cómo extender la base

**Añadir una página estática** (p. ej. «Precios»):

1. Ruta en `src/i18n/routes.ts` (`pricing: { es: 'precios', en: 'pricing' }`).
2. Claves `meta.pricing.title` / `meta.pricing.description` y textos en todos los diccionarios.
3. Vista `src/views/PricingView.astro` (copiar la estructura de `AboutView`).
4. Añadir `'pricing'` a `STATIC_PAGES` en `src/lib/pages.ts` y la rama correspondiente en `src/pages/[...path].astro`.
5. Opcional: entrada en `mainNav` (`src/config/nav.ts`).

**Añadir una colección con páginas propias** (p. ej. «Proyectos»):

1. Colección y schema en `src/content.config.ts`, contenido en `src/content/projects/<lang>/`.
2. Ruta en `routes.ts`, consulta en `src/lib/queries.ts`.
3. Tipo de página en `src/lib/pages.ts` (`contentPages('project', 'projects', …)`), con su test en `pages.test.ts`.
4. Añadirla a `ROUTED_COLLECTIONS` en `src/lib/content-meta.ts` (sitemap) y a la lista de `scripts/check-i18n.ts`.
5. Vista de detalle y rama en `[...path].astro`.

**Añadir un bloque**: componente en `src/components/blocks/` con props tipadas, estilos _scoped_ que solo usen tokens semánticos y encabezado de nivel configurable si puede aparecer en contextos distintos.
