# Spec — Genesis Web Base (plantilla Astro multi-negocio)

- **Fecha:** 2026-09-30
- **Estado:** pendiente de revisión
- **Fuente:** `web-base-knowledge.md` (extraído de `portfolio-web`), generalizado a cualquier tipo de negocio.

---

## 1. Objetivo

Plantilla reutilizable que se clona para arrancar la web de **cualquier negocio** (tienda, restaurante, clínica, despacho, SaaS…). Sale de serie con SEO técnico, GEO, accesibilidad y rendimiento.

### Criterios de éxito

1. Adaptar a un negocio nuevo = editar **config + tokens CSS + diccionarios + contenido**. Sin tocar layouts, componentes SEO ni rutas.
2. Añadir/quitar un idioma = config + diccionario + carpeta de contenido. Con 1 solo idioma el sitio funciona sin hreflang ni selector.
3. `pnpm build` falla si: falta una traducción de UI, un contenido no cumple su schema, o un `routeKey` no existe.
4. Lighthouse móvil ≥ 90 en Performance, Accessibility, Best Practices y SEO sobre el contenido de ejemplo.
5. JSON-LD válido (validator.schema.org) en todas las plantillas de página.
6. Contenido clave visible sin JavaScript.
7. `docker compose up` sirve el sitio con headers de seguridad, caché y 301 activos.

### Fuera de alcance (YAGNI)

- CMS headless, SSR, backend propio, envío de email desde servidor.
- Modo oscuro.
- Buscador interno, paginación del blog (se añade cuando haya >20 posts), comentarios.
- Configuración de HTTPS/DNS (se hace a mano en el servidor).
- Configs para Netlify/Vercel/Cloudflare.

---

## 2. Stack

| Pieza | Elección | Notas |
|---|---|---|
| Framework | Astro 6, `output: 'static'` | 0 KB JS por defecto |
| Node | `>=22.12.0` en `engines` | |
| Gestor | pnpm, versión fijada en `packageManager` | ver §2.1 |
| TypeScript | `astro/tsconfigs/strict` | |
| Estilos | CSS propio con custom properties | sin Tailwind |
| Fuentes | Self-hosted (Fonts API de Astro o `@fontsource`), máx. 2 familias / 4 pesos, subset latin | preload solo de la fuente del H1 |
| Imágenes | `astro:assets` (`<Image>`/`<Picture>`) → AVIF/WebP + srcset | |
| Integraciones | `@astrojs/sitemap`, `@astrojs/rss` | |
| Tests | Vitest para helpers (`src/lib`, `src/i18n`) | |
| Formato | Prettier + `prettier-plugin-astro` | |

### 2.1 Seguridad de dependencias (pnpm)

- `packageManager: "pnpm@<versión>"` y `engine-strict=true`.
- `pnpm-workspace.yaml`:
  - `minimumReleaseAge: 1440` (no instalar versiones publicadas hace < 24 h; mitiga paquetes comprometidos).
  - Scripts de instalación bloqueados salvo lista blanca explícita (`onlyBuiltDependencies`/`allowBuilds`, según versión de pnpm; p. ej. `esbuild`, `sharp`).
- Lockfile comprometido; en Docker y CI `pnpm install --frozen-lockfile`.
- Script `pnpm audit` documentado en el checklist.

### 2.2 Scripts

| Script | Acción |
|---|---|
| `dev` | `astro dev` |
| `build` | `astro build` + generación de `deploy/nginx/redirects.conf` |
| `preview` | `astro preview` |
| `check` | `astro check` + `check:i18n` + `test` |
| `check:i18n` | valida claves de diccionarios y paridad de contenido entre idiomas (aviso, no error, si falta traducción de contenido) |
| `test` | `vitest run` |
| `format` | `prettier --write .` |

---

## 3. Estructura de carpetas

```
/
├── astro.config.mjs
├── package.json · pnpm-workspace.yaml · .npmrc · tsconfig.json
├── .env.example                  PUBLIC_GA_ID, PUBLIC_CONTACT_ENDPOINT
├── Dockerfile · docker-compose.yml · .dockerignore
├── deploy/nginx/
│   ├── nginx.conf                headers, CSP, caché, 404, include redirects
│   └── redirects.conf            GENERADO en build desde src/config/redirects.ts
├── scripts/
│   ├── gen-nginx-redirects.ts
│   └── check-i18n.ts
├── docs/
│   ├── knowledge-base.md         base de conocimiento generalizada (sustituye a web-base-knowledge.md)
│   ├── new-project.md            pasos para arrancar un proyecto desde la base
│   └── launch-checklist.md
├── public/
│   ├── favicon.svg · favicon.ico · apple-touch-icon.png
│   └── og-default.jpg            1200×630
└── src/
    ├── config/
    │   ├── site.ts               fuente única del negocio (ver §4)
    │   └── redirects.ts          301 { from, to }
    ├── i18n/
    │   ├── config.ts             locales, defaultLocale, etiquetas, códigos BCP-47/OG
    │   ├── ui/es.ts · ui/en.ts   diccionarios (es define UiKey; resto Record<UiKey,string>)
    │   ├── routes.ts             routeKey → slug por idioma
    │   └── utils.ts              t(), localizePath(), getAlternates(), getLangFromUrl()
    ├── content.config.ts         colecciones + schemas zod
    ├── content/
    │   ├── services/{es,en}/*.md
    │   ├── blog/{es,en}/*.md
    │   ├── faq/{es,en}.yaml
    │   └── legal/{es,en}/*.md    aviso-legal, privacidad, cookies
    ├── lib/
    │   ├── schema.ts             builders JSON-LD (@graph)
    │   ├── seo.ts                title/description helpers, URLs absolutas
    │   └── dates.ts
    ├── layouts/
    │   └── BaseLayout.astro      <html>, Seo, skip-link, Header, <main>, Footer, CookieBanner, Analytics
    ├── components/
    │   ├── seo/Seo.astro · seo/JsonLd.astro
    │   ├── layout/Header.astro · Footer.astro · LanguageSwitcher.astro · Breadcrumbs.astro · SkipLink.astro
    │   ├── ui/Button.astro · Card.astro · Section.astro · Prose.astro · Picture.astro · Icon.astro
    │   ├── blocks/Hero.astro · FeatureGrid.astro · CtaBand.astro · FaqList.astro · ContactInfo.astro · ContactForm.astro · PostList.astro
    │   └── consent/CookieBanner.astro · Analytics.astro
    ├── views/                    una vista por tipo de página, recibe `lang` (+ entry si aplica)
    │   ├── HomeView.astro · ServicesView.astro · ServiceDetailView.astro
    │   ├── AboutView.astro · ContactView.astro · FaqView.astro
    │   ├── BlogView.astro · PostView.astro · LegalView.astro
    ├── pages/
    │   ├── [...path].astro       ruta dinámica única: genera todas las páginas estáticas de todos los idiomas
    │   ├── 404.astro
    │   ├── robots.txt.ts
    │   ├── llms.txt.ts
    │   └── (endpoint RSS)        un feed por idioma: /rss.xml, /en/rss.xml (getStaticPaths)
    ├── assets/                   imágenes procesadas
    └── styles/
        ├── tokens.css · base.css · utilities.css
```

**Principio:** vista = composición de bloques; la ruta dinámica solo resuelve `(lang, routeKey, entry)` → vista. Ningún dato (dominio, slug, texto, contacto) se escribe en más de un sitio.

---

## 4. Configuración del negocio — `src/config/site.ts`

```ts
export const SITE = {
  url: 'https://example.com',            // dominio definitivo, sin barra final
  name: 'Nombre Comercial',
  legalName: 'Razón Social S.L.',
  taxId: 'B00000000',                     // aviso legal
  entity: {
    type: 'LocalBusiness',                // 'Organization' | 'LocalBusiness' | subtipo schema.org ('Restaurant', 'Dentist'…)
    priceRange: '€€',                     // solo LocalBusiness
    areaServed: ['Madrid'],
  },
  contact: {
    email: 'hola@example.com',
    phone: '+34600000000',
    whatsapp: '34600000000',              // opcional
  },
  address: {                              // opcional; obligatorio si LocalBusiness
    street: 'Calle Ejemplo 1', locality: 'Madrid', region: 'Madrid',
    postalCode: '28001', country: 'ES',
  },
  geo: { lat: 40.4168, lng: -3.7038 },    // opcional
  openingHours: [                         // opcional
    { days: ['Mo','Tu','We','Th','Fr'], opens: '09:00', closes: '18:00' },
  ],
  social: { linkedin: '', instagram: '', facebook: '', x: '', youtube: '' }, // vacíos se omiten
  logo: '/logo.png',                      // para schema (mín. 112×112)
  ogImage: '/og-default.jpg',
  themeColor: '#ffffff',
  twitterHandle: '',                      // opcional
  aiTraining: true,                       // permitir bots de entrenamiento de IA (§9.2)
} as const;
```

- `SITE.url` es la única fuente de dominio: `astro.config.mjs` la importa para `site`.
- Campos vacíos/ausentes → se omiten en schema, footer, llms.txt (nunca se emite `""`).
- Variables de entorno (`.env.example`):
  - `PUBLIC_GA_ID` — si vacío, no se carga analítica ni banner.
  - `PUBLIC_CONTACT_ENDPOINT` — si vacío, el formulario no se renderiza (solo `ContactInfo`).

---

## 5. Internacionalización

### 5.1 Config — `src/i18n/config.ts`

```ts
export const locales = {
  es: { label: 'Español', hreflang: 'es', og: 'es_ES', dir: 'ltr' },
  en: { label: 'English', hreflang: 'en', og: 'en_US', dir: 'ltr' },
} as const;
export const defaultLocale = 'es';
export type Lang = keyof typeof locales;
```

- Idioma por defecto sin prefijo (`/`, `/servicios`); resto con prefijo (`/en/`, `/en/services`).
- `astro.config.mjs` deriva `i18n` y el `sitemap({ i18n })` de este fichero.
- Si `Object.keys(locales).length === 1`: no se emiten `hreflang`, `og:locale:alternate` ni `LanguageSwitcher`.

### 5.2 Diccionarios

- `ui/es.ts` es el idioma de referencia: `export const es = { … } as const; export type UiKey = keyof typeof es;`
- Resto: `export const en: Record<UiKey, string> = { … }` → TypeScript falla si falta o sobra una clave.
- Convención de claves: `seccion.elemento` (`nav.services`, `home.hero.title`, `contact.form.submit`).
- `check:i18n` detecta además claves duplicadas en el literal (JS se queda con la última en silencio).

### 5.3 Rutas — `src/i18n/routes.ts`

```ts
export const routes = {
  home:     { es: '',               en: '' },
  services: { es: 'servicios',      en: 'services' },
  about:    { es: 'sobre-nosotros', en: 'about' },
  contact:  { es: 'contacto',       en: 'contact' },
  faq:      { es: 'preguntas-frecuentes', en: 'faq' },
  blog:     { es: 'blog',           en: 'blog' },
  legal:    { es: 'legal',          en: 'legal' },
} as const satisfies Record<string, Record<Lang, string>>;
```

- `localizePath(routeKey, lang, subSlug?)` → `/servicios/tiendas-online`, `/en/services/online-stores`.
- Todas las URLs terminan **sin** barra final, salvo la raíz `/` (detalle en §9.4).

### 5.4 Contenido traducido

- Cada entrada de colección tiene `translationKey` (común entre idiomas) y `slug` localizado.
- `getAlternates(collection, translationKey)` → `{ es: url, en: url }` solo para los idiomas donde existe la entrada. hreflang se emite solo para esos.
- Si una entrada no existe en un idioma, no se genera página (no se hace fallback de contenido; sí de UI al idioma por defecto).

---

## 6. Colecciones de contenido — `src/content.config.ts`

| Colección | Loader | Campos (zod) |
|---|---|---|
| `services` | glob `services/**/*.md` | `title`, `description` (140–160), `translationKey`, `slug`, `order`, `summary` (40–60 palabras, bloque citable), `image?`, `imageAlt?`, `faqs?: {q,a}[]`, `updated: date`, `draft: boolean` |
| `blog` | glob `blog/**/*.md` | `title`, `description`, `translationKey`, `slug`, `published: date`, `updated?: date`, `author`, `image?`, `imageAlt?`, `tags: string[]`, `draft` |
| `faq` | file `faq/{lang}.yaml` | `items: {id, q, a, category?}[]` |
| `legal` | glob `legal/**/*.md` | `title`, `translationKey` (`legal-notice`/`privacy`/`cookies`), `slug`, `updated: date` |

- Idioma de la entrada = primera carpeta de su id (`es/…`).
- `draft: true` → excluido en build de producción.
- `image` + `imageAlt` obligatorios juntos (refine).
- Validación de longitud de `description` → **aviso** en `check:i18n`, no error (el copy lo ajusta cada proyecto).
- Contenido de ejemplo: 3 servicios, 2 posts, 6 FAQ, 3 legales, en ES y EN; textos genéricos marcados claramente como ejemplo ("Servicio de ejemplo…").

---

## 7. Páginas

| routeKey | URL ES / EN | Vista | Tipo schema `WebPage` | Notas |
|---|---|---|---|---|
| home | `/` · `/en` | HomeView | `WebPage` | Hero (H1 = propuesta de valor), servicios destacados, prueba social, FAQ resumida (3), CTA |
| services | `/servicios` · `/en/services` | ServicesView | `CollectionPage` | Grid de servicios |
| services + slug | `/servicios/{slug}` | ServiceDetailView | `WebPage` + `Service` | Definición inicial ("X es…"), contenido MD, FAQ propia (→ `FAQPage`), CTA, servicios relacionados |
| about | `/sobre-nosotros` · `/en/about` | AboutView | `AboutPage` | Historia, equipo, cifras factuales |
| contact | `/contacto` · `/en/contact` | ContactView | `ContactPage` | ContactInfo (+ mapa estático enlazado, sin iframe) + ContactForm |
| faq | `/preguntas-frecuentes` · `/en/faq` | FaqView | `FAQPage` | Agrupado por categoría |
| blog | `/blog` · `/en/blog` | BlogView | `Blog` / `CollectionPage` | Lista ordenada por fecha |
| blog + slug | `/blog/{slug}` | PostView | `WebPage` + `BlogPosting` | Fecha publicación/actualización visible, autor, tiempo de lectura |
| legal + slug | `/legal/{slug}` | LegalView | `WebPage` | `noindex, follow` en aviso legal y cookies; privacidad indexable |
| — | `/404` | 404.astro | — | `noindex`; texto en idioma por defecto, enlaces a secciones principales y a la home de cada idioma. Sin detección de idioma en cliente (YAGNI) |

- Breadcrumbs visibles + `BreadcrumbList` en todas las páginas salvo home.
- Enlazado interno: Header (servicios, sobre nosotros, blog, FAQ, contacto + CTA), Footer (todo + legales + datos de contacto + redes), CTA a contacto en cada vista.

---

## 8. Layout, `<head>` y JSON-LD

### 8.1 `BaseLayout.astro`

Props: `lang`, `title`, `description`, `alternates: Partial<Record<Lang,string>>`, `ogImage?`, `ogType?` (`website`|`article`), `noindex?`, `schema: object[]` (nodos a añadir al `@graph`), `breadcrumbs?`.

Estructura: `<html lang dir class="no-js">` → `<head>` (Seo + JsonLd + fuentes + script inline `no-js→js`) → `<body>` → SkipLink → Header → `<main id="main">` → Footer → CookieBanner → Analytics. `header`, `main`, `footer` son hermanos.

### 8.2 `Seo.astro` — orden del `<head>`

1. `charset`, `viewport`
2. `<title>` (patrón `Página — Marca`; home: `Marca — propuesta`), `description`
3. `robots` (`index, follow` o `noindex, follow`), `canonical` absoluto
4. `hreflang` por cada alternate + `x-default` (→ idioma por defecto)
5. OG: `type`, `url`, `site_name`, `title`, `description`, `locale`, `locale:alternate`, `image` (+ `width`/`height`/`alt`)
6. Twitter: `summary_large_image`, `site?`, `title`, `description`, `image`
7. Iconos: `favicon.svg`, `favicon.ico`, `apple-touch-icon`; `theme-color`
8. `alternate` RSS del idioma actual
9. `<slot />` extra

### 8.3 `src/lib/schema.ts`

Builders puros (testeados con Vitest) que devuelven nodos con `@id` estables:

- `websiteNode(lang)` → `{SITE.url}/#website`, `inLanguage`, `publisher → #organization`
- `organizationNode(lang)` → `{SITE.url}/#organization`, `@type` = `SITE.entity.type`, `name`, `legalName`, `url`, `logo`, `image`, `email`, `telephone`, `sameAs` (redes no vacías), y si es LocalBusiness o subtipo: `address` (`PostalAddress`), `geo`, `openingHoursSpecification`, `priceRange`, `areaServed`
- `webPageNode({ url, type, name, description, lang, breadcrumbId?, dateModified? })` → `{url}#webpage`, `isPartOf → #website`, `about → #organization`
- `breadcrumbNode(items)` → `{url}#breadcrumb`
- `serviceNode(entry)` → `provider → #organization`, `areaServed`
- `faqNode(items)` → `FAQPage.mainEntity[Question/acceptedAnswer]`
- `articleNode(entry)` → `BlogPosting`, `author`, `datePublished`, `dateModified`, `publisher → #organization`, `image`
- `graph(nodes[])` → `{ "@context": "https://schema.org", "@graph": [...] }`

Reglas: textos del schema salen del mismo diccionario/contenido que el texto visible; URLs de breadcrumb y nodos siempre del idioma de la página; nunca propiedades vacías.

`organizationNode` + `websiteNode` se emiten en todas las páginas.

---

## 9. SEO técnico y GEO

### 9.1 Sitemap
`@astrojs/sitemap` con `i18n: { defaultLocale, locales: {es:'es-ES', en:'en-US'} }` derivado de `i18n/config.ts`; `filter` excluye `404` y legales `noindex`; `serialize` añade `lastmod` desde `updated`/`published` del contenido (mapa URL → fecha construido en config).

### 9.2 `robots.txt` (endpoint)
```
User-agent: *
Allow: /

# Buscadores de IA (búsqueda/citación)
User-agent: OAI-SearchBot / ChatGPT-User / PerplexityBot / Claude-SearchBot / Claude-User / Bingbot / Applebot
Allow: /

# Entrenamiento de modelos (decidir por proyecto: AI_TRAINING en site.ts)
User-agent: GPTBot / ClaudeBot / Google-Extended / Applebot-Extended / CCBot
Allow: /   (o Disallow: / si SITE.aiTraining === false)

Sitemap: {SITE.url}/sitemap-index.xml
```

### 9.3 `llms.txt` (endpoint)
Generado desde `SITE` + colecciones en el idioma por defecto (y enlace a las versiones en otros idiomas): nombre y descripción factual, tipo de negocio, ubicación/área, lista de servicios con URL y `summary`, FAQ clave, posts recientes, contacto, URLs canónicas.

### 9.4 URLs
- `trailingSlash: 'never'` y `build.format: 'file'` → `/servicios.html` servido como `/servicios` por Nginx (`try_files $uri $uri.html $uri/index.html =404`). Canonical sin barra.
- Home de idiomas no por defecto: `/en` (canonical `/en`).

### 9.5 Contenido citable (GEO)
- Cada servicio: `summary` de 40–60 palabras renderizado arriba como definición.
- FAQ en home, servicios y página FAQ.
- Fechas de actualización visibles (`<time datetime>`).
- Entidad coherente: mismo nombre, URL y `sameAs` en web, schema y llms.txt (todo desde `SITE`).

---

## 10. Sistema de diseño

### 10.1 `tokens.css`
Paleta base blanco / negro / grises / rojo (enlaces). Todos los pares texto/fondo ≥ 4,5:1.

- **Color primitivos:** `--white`, `--black`, `--gray-50…900` (escala de 10), `--red-500/600/700`.
- **Color semánticos:** `--color-bg`, `--color-bg-subtle`, `--color-bg-muted`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-text-inverse`, `--color-border`, `--color-border-strong`, `--color-link`, `--color-link-hover`, `--color-link-visited`, `--color-accent`, `--color-accent-contrast`, `--color-focus`, `--color-success`, `--color-warning`, `--color-error`, `--color-overlay`, `--color-selection-bg/fg`.
- **Tipografía:** `--font-sans`, `--font-display`, `--font-mono`; pesos `--fw-regular/medium/semibold/bold`; escala fluida `--step--1 … --step-5` con `clamp()`; `--lh-tight/snug/normal/relaxed`; `--tracking-tight/normal/wide`; `--measure: 65ch`.
- **Espaciado:** `--space-3xs … --space-3xl` (fluido) + `--gutter`, `--section-gap`.
- **Layout:** `--container-max: 1200px`, `--container-narrow: 760px`, `--container-pad`.
- **Bordes:** `--radius-sm/md/lg/full`, `--border-width`.
- **Sombras:** `--shadow-sm/md/lg`.
- **Movimiento:** `--duration-fast/base/slow`, `--ease-out`, `--ease-in-out`.
- **Capas:** `--z-base/dropdown/sticky/overlay/modal/toast`.
- **Controles:** `--control-height`, `--control-pad-x`, `--focus-ring`.
- **Breakpoints** (documentados, no utilizables en `@media`): `sm 600px`, `md 900px`, `lg 1200px`. Solo esos tres en todo el CSS.

### 10.2 `base.css`
Reset moderno, `box-sizing`, tipografía base, headings, enlaces (subrayado, `text-underline-offset`), listas, `img`/`svg` responsive, formularios (inputs, labels, estados `:invalid`/`:focus-visible`), tablas, `:focus-visible` global, `::selection`, `.skip-link`, `prefers-reduced-motion`, reveal seguro (`.js .reveal`), `.visually-hidden`.

### 10.3 `utilities.css`
`.container`, `.container--narrow`, `.stack` (flujo vertical con `--stack-gap`), `.cluster`, `.grid-auto` (auto-fit minmax), `.visually-hidden`, `.text-muted`, `.prose` (medida de lectura, `hyphens: auto`, alineación izquierda).

### 10.4 Componentes
Estilos en `<style>` scoped. Mobile-first con `min-width`. Hero con `min-height: auto` (no `100vh`; si se usa altura completa, `100svh`). Tarjetas con container queries.

---

## 11. Accesibilidad

- `lang`/`dir` en `<html>`; skip-link a `#main`.
- Header: burger `<button aria-expanded aria-controls aria-label>`; menú con `hidden`; cierre con `Esc`, al pulsar enlace y al cruzar a `md`; foco vuelve al botón al cerrar.
- `aria-current="page"` en nav y selector de idioma; enlaces de idioma con `hreflang` y `lang`.
- SVG decorativos `aria-hidden="true"`; enlaces solo-icono con `aria-label`.
- Formularios: `<label>` explícitos, `autocomplete`, errores con `aria-describedby`, `aria-live="polite"` para estado de envío.
- FAQ con `<details>/<summary>` (funciona sin JS).
- `prefers-reduced-motion` anula transiciones y reveal.
- Enlaces externos: `rel="noopener noreferrer"` y aviso visual/`visually-hidden` "(se abre en nueva pestaña)".

---

## 12. Rendimiento

- JS solo en: toggle de menú, reveal (IntersectionObserver), banner de cookies, analítica, envío del formulario. Todo vanilla en `<script>` de Astro.
- Imagen LCP del hero: `<Picture>` AVIF/WebP, `loading="eager"`, `fetchpriority="high"`; resto `lazy` + `decoding="async"`; siempre `width`/`height`.
- Fuentes self-hosted, `font-display: swap`, preload solo la del H1.
- Iconos SVG inline (`Icon.astro` con set mínimo: menu, close, mail, phone, whatsapp, map-pin, clock, arrow-right, external, redes).
- Objetivo CWV: LCP < 2,5 s, INP < 200 ms, CLS < 0,1.

---

## 13. Analítica y consentimiento

- `Analytics.astro` solo se renderiza si `PUBLIC_GA_ID`.
- Consent Mode v2: antes de cargar gtag se define `gtag('consent','default',{ ad_storage, ad_user_data, ad_personalization, analytics_storage: 'denied', wait_for_update: 500 })`.
- Estado del consentimiento en `localStorage` (`consent.v1` = `granted|denied` + fecha). Si existe, se aplica `gtag('consent','update', …)` sin mostrar banner.
- `CookieBanner.astro`: no bloqueante (no modal), botones **Aceptar** y **Rechazar** con igual peso visual, enlace a la política de cookies; se reabre desde enlace "Configurar cookies" en el footer. Textos del diccionario.
- `gtag.js` se carga con `async` tras `requestIdleCallback` (fallback `setTimeout`).
- Eventos: atributos `data-track="nombre_evento"` en CTAs (email, teléfono, WhatsApp, envío de formulario); un listener delegado envía `gtag('event', …)` solo si hay consentimiento.

---

## 14. Formulario de contacto

- Si `PUBLIC_CONTACT_ENDPOINT` está vacío → no se renderiza; solo `ContactInfo`.
- Campos: nombre, email, teléfono (opcional), mensaje, casilla de aceptación de privacidad (obligatoria, enlaza a privacidad), honeypot oculto.
- Funciona sin JS (`<form method="post" action={endpoint}>`). Con JS: `fetch` POST (`FormData`), estados enviando/éxito/error en región `aria-live`, evento `generate_lead`.
- Validación nativa HTML5 + mensajes del diccionario.

---

## 15. Despliegue: Docker + Nginx

### 15.1 `Dockerfile` (multi-stage)
1. `node:22-alpine` → `corepack enable` → copia manifest + lockfile → `pnpm install --frozen-lockfile` → copia código → `pnpm build`. Build args `PUBLIC_GA_ID`, `PUBLIC_CONTACT_ENDPOINT`.
2. `nginxinc/nginx-unprivileged:alpine` → copia `dist/` y `deploy/nginx/*.conf`; escucha en `8080`; usuario no root.

### 15.2 `deploy/nginx/nginx.conf`
- `server_tokens off`; gzip para text/css/js/json/xml/svg/txt.
- `try_files $uri $uri.html $uri/index.html =404`; `error_page 404 /404.html`.
- Redirección de barra final → sin barra (301), salvo raíz.
- `include redirects.conf;` (mapa `from → to` con `return 301`).
- Headers en todas las respuestas: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`, `Cross-Origin-Opener-Policy: same-origin`, `Strict-Transport-Security: max-age=31536000; includeSubDomains` (comentado con nota: activar solo con HTTPS operativo).
- `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com {CONTACT_ENDPOINT_ORIGIN}; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline'; font-src 'self'; form-action 'self' {CONTACT_ENDPOINT_ORIGIN}; frame-ancestors 'none'; base-uri 'self'; object-src 'none'`. El origen del endpoint se inyecta por variable de entorno del contenedor (`envsubst` en la plantilla de nginx-unprivileged).
- Caché: `/_astro/*` → `public, max-age=31536000, immutable`; HTML → `no-cache`; resto de estáticos → `max-age=86400`.
- Tipos: `llms.txt`/`robots.txt` → `text/plain; charset=utf-8`.

### 15.3 `docker-compose.yml`
Servicio `web`, build con args desde `.env`, puerto `8080:8080`, `restart: unless-stopped`, `read_only: true` + `tmpfs` para `/tmp` y caché de nginx, healthcheck `wget -qO- http://localhost:8080/`.

---

## 16. Calidad y tests

- `astro check` sin errores ni warnings.
- Vitest (`src/**/*.test.ts`): `localizePath`, `getAlternates`, `t()` con fallback, builders de `schema.ts` (omisión de vacíos, `@id` estables, LocalBusiness vs Organization, URLs por idioma), generador de redirects de Nginx.
- `check:i18n`: claves duplicadas, paridad de contenido entre idiomas (aviso), longitudes de title/description (aviso).
- Verificación manual final (documentada en checklist): build, `docker compose up`, Lighthouse móvil, validator.schema.org, navegación con teclado, sin JS.

---

## 17. Documentación

- `README.md`: qué es, requisitos, comandos, estructura resumida, enlace a `docs/`.
- `docs/new-project.md`: pasos para crear un proyecto desde la base (clonar, `site.ts`, tokens, idiomas, diccionarios, contenido, imágenes/OG/favicon, `.env`, redirects, build, Docker).
- `docs/launch-checklist.md`: checklist de lanzamiento generalizado (configuración, SEO, GEO, responsive/rendimiento, accesibilidad, legal/analítica, seguridad).
- `docs/knowledge-base.md`: `web-base-knowledge.md` generalizado a negocio genérico:
  - **Quitar:** `Person` como entidad principal, CV/timeline de experiencia, cursor animado/botones magnéticos, referencias a Netlify, ejemplos concretos del portfolio.
  - **Añadir/cambiar:** entidad `Organization`/`LocalBusiness` configurable, N idiomas, content collections, blog + `BlogPosting`, legales UE, Consent Mode v2, formulario por endpoint, Docker+Nginx, seguridad pnpm, GEO para negocio (servicios citables, FAQ, NAP coherente).
  - El fichero original `web-base-knowledge.md` se mueve a `docs/archive/` como referencia histórica.

---

## 18. Riesgos / decisiones abiertas por proyecto

- `aiTraining` (permitir o no bots de entrenamiento) → se decide en cada proyecto, default permitido.
- Textos legales son plantillas, **no** asesoramiento legal: cada proyecto debe revisarlos.
- CSP con `'unsafe-inline'` en scripts (necesario para el snippet inline de consent/no-js). Mejora futura: hashes CSP generados en build.
- HSTS desactivado por defecto hasta confirmar HTTPS en el servidor.
