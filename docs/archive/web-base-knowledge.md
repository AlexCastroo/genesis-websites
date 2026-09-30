# Base de conocimiento — Web base Astro (estructura, responsive, SEO, GEO)

> Documento extraído del proyecto `portfolio-web` (Astro 6, estático, bilingüe ES/EN, desplegado en Netlify).
> Objetivo: servir de especificación para generar una **web base reutilizable** en proyectos futuros.
>
> Leyenda:
> - ✅ **Aplicado** — ya está en este proyecto y funciona.
> - ⚠️ **Mejorar en la base** — patrón usado aquí con un defecto conocido; la plantilla debe corregirlo.
> - ➕ **Añadir en la base** — no existe en este proyecto, pero debe venir de serie en la plantilla.

---

## Índice

1. [Stack y configuración](#1-stack-y-configuración)
2. [Estructura de carpetas](#2-estructura-de-carpetas)
3. [Layout base y `<head>`](#3-layout-base-y-head)
4. [Internacionalización (i18n)](#4-internacionalización-i18n)
5. [HTML semántico y jerarquía de encabezados](#5-html-semántico-y-jerarquía-de-encabezados)
6. [Sistema de diseño en CSS](#6-sistema-de-diseño-en-css)
7. [Responsive](#7-responsive)
8. [Imágenes y rendimiento](#8-imágenes-y-rendimiento)
9. [SEO técnico](#9-seo-técnico)
10. [Datos estructurados (JSON-LD)](#10-datos-estructurados-json-ld)
11. [GEO — optimización para buscadores de IA](#11-geo--optimización-para-buscadores-de-ia)
12. [Accesibilidad](#12-accesibilidad)
13. [Analítica](#13-analítica)
14. [Seguridad y despliegue (Netlify)](#14-seguridad-y-despliegue-netlify)
15. [Errores detectados y lecciones](#15-errores-detectados-y-lecciones)
16. [Checklist de lanzamiento](#16-checklist-de-lanzamiento)
17. [Plantillas de arranque](#17-plantillas-de-arranque)

---

## 1. Stack y configuración

| Pieza | Elección | Motivo |
|---|---|---|
| Framework | Astro 6 (salida estática) | HTML puro por defecto, 0 KB de JS salvo lo que se añade; ideal para SEO y Core Web Vitals |
| Gestor de paquetes | pnpm | Rápido, lockfile determinista |
| Node | `>=22.12.0` (en `engines`) | Requisito de Astro 6 |
| TypeScript | `astro/tsconfigs/strict` | Tipado estricto en props y claves de traducción |
| Estilos | CSS propio con variables (sin Tailwind) | Control total, sin dependencias |
| Sitemap | `@astrojs/sitemap` | Generación automática de `sitemap-index.xml` |
| Deploy | Netlify | Estático, CDN, redirects y headers por fichero |

### `astro.config.mjs` ✅

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tudominio.com',        // OBLIGATORIO: base de canonical, hreflang, sitemap
  integrations: [sitemap()],
  redirects: {
    '/en/servicios': '/en/services',     // URLs antiguas o mal traducidas
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false }, // ES en "/", EN en "/en/"
  },
});
```

**Reglas:**
- `site` debe ser el **dominio definitivo** desde el primer día. ⚠️ Aquí `site` apunta a `netlify.app` mientras el schema usa `alexcastro.dev` → señales de entidad inconsistentes. En la base: una sola constante `SITE_URL` usada en todas partes.
- ➕ Configurar el sitemap con i18n para que emita `xhtml:link` alternates:

```js
sitemap({
  i18n: { defaultLocale: 'es', locales: { es: 'es-ES', en: 'en-US' } },
})
```

---

## 2. Estructura de carpetas

Estructura actual ✅ + propuesta para la base ➕:

```
/
├── astro.config.mjs
├── netlify.toml                 ➕ headers de seguridad + caché
├── public/
│   ├── robots.txt               ✅ incluye bots de IA + Sitemap
│   ├── llms.txt                 ✅ resumen para LLMs
│   ├── favicon.svg / .ico       ✅
│   ├── og-image.jpg             ➕ 1200×630 (referenciado pero falta aquí)
│   └── *.pdf                    ✅ descargables (CV, dossier…)
└── src/
    ├── config/site.ts           ➕ SITE_URL, nombre, redes, email, teléfono (fuente única)
    ├── i18n/
    │   ├── ui.ts                ✅ diccionario tipado por idioma
    │   └── utils.ts             ✅ useTranslations(lang)
    ├── layouts/
    │   └── Layout.astro         ✅ <head> SEO completo + estilos globales
    ├── components/              ✅ un componente por sección (Nav, Hero, About…)
    │   └── seo/JsonLd.astro     ➕ helper para inyectar schema
    ├── styles/                  ➕ tokens.css, base.css, utilities.css (sacar del Layout)
    ├── assets/                  ➕ imágenes procesadas por astro:assets
    └── pages/
        ├── index.astro          ✅ ES (idioma por defecto, sin prefijo)
        ├── servicios.astro      ✅
        └── en/
            ├── index.astro      ✅
            └── services.astro   ✅ slug traducido
```

**Principios:**
- **Página = composición** de componentes. La página solo monta Layout + JSON-LD + secciones. Ejemplo real:

```astro
<Layout lang="es" hreflangEs="/" hreflangEn="/en/">
  <Fragment slot="head">
    <script type="application/ld+json" set:html={jsonLd} />
  </Fragment>
  <Nav lang="es" />
  <main>
    <Hero lang="es" />
    <About lang="es" />
    <Stack lang="es" />
    <Work lang="es" />
    <Contact lang="es" />
  </main>
</Layout>
```

- Todos los componentes reciben `lang` como prop y traducen internamente → el mismo componente sirve para ambos idiomas.
- ⚠️ `servicios.astro` y `en/services.astro` son ~600 líneas casi idénticas (solo cambian imports, `lang` y unas etiquetas). En la base: **un componente `ServicesPage.astro` con prop `lang`** y dos páginas de 5 líneas que lo montan. Evita que los idiomas diverjan.

---

## 3. Layout base y `<head>`

Layout recibe props tipadas con valores por defecto por idioma ✅:

```ts
interface Props {
  lang: Lang;
  title?: string;
  description?: string;
  hreflangEs?: string;   // ruta relativa: "/", "/servicios"
  hreflangEn?: string;   // "/en/", "/en/services"
  ogImage?: string;      // "/og-image.jpg"
}
```

Orden del `<head>` ✅:

1. `charset`, favicons (SVG + ICO fallback), `viewport`
2. `<title>` + `meta description` + `author` + `robots`
3. `canonical` (URL absoluta de la página actual)
4. `hreflang` es / en / `x-default` (absolutos)
5. Open Graph: `type`, `url`, `title`, `description`, `locale`, `image` + `width`/`height`
6. Twitter Card: `summary_large_image`, `site`, `title`, `description`, `image`
7. `<slot name="head" />` → JSON-LD por página
8. Fuentes (preconnect + stylesheet)
9. Analítica

```astro
---
const siteBase = (Astro.site?.href ?? 'https://tudominio.com').replace(/\/$/, '');
---
<html lang={lang}>
<head>
  <meta charset="utf-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href={Astro.url.href} />
  <link rel="alternate" hreflang="es" href={`${siteBase}${hreflangEs}`} />
  <link rel="alternate" hreflang="en" href={`${siteBase}${hreflangEn}`} />
  <link rel="alternate" hreflang="x-default" href={`${siteBase}${hreflangEs}`} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={Astro.url.href} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:locale" content={lang === 'es' ? 'es_ES' : 'en_US'} />
  <meta property="og:image" content={`${siteBase}${ogImage}`} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={`${siteBase}${ogImage}`} />
  <slot name="head" />
</head>
```

**Reglas de contenido:**
- **Title**: 50–60 caracteres. Patrón `Marca — Rol/Servicio + keyword principal` (home) o `Servicio A, B y C | Marca — Rol` (landing).
- **Description**: 140–160 caracteres, incluye keyword + propuesta de valor + CTA suave ("Presupuesto sin coste").
- Cada página pasa su propio `title`/`description`; los defaults del Layout solo cubren la home.
- ➕ Añadir `og:locale:alternate` con el otro idioma.
- ➕ Añadir `<meta name="theme-color">` y `apple-touch-icon`.

---

## 4. Internacionalización (i18n)

### Diccionario tipado ✅ (`src/i18n/ui.ts`)

```ts
export const defaultLang = 'es' as const;
export type Lang = 'es' | 'en';

export const ui = {
  es: { 'nav.about': 'Sobre mí', 'hero.cta': 'Contáctame', /* … */ },
  en: { 'nav.about': 'About',    'hero.cta': 'Contact me', /* … */ },
} as const;

export type UiKey = keyof typeof ui['es'];
```

### Helper con fallback ✅ (`src/i18n/utils.ts`)

```ts
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return (ui[lang][key] ?? ui[defaultLang][key]) as string;
  };
}
```

**Convenciones de claves:** `seccion.elemento` (`hero.cta`, `work.job1.desc`), prefijo por página (`sv.*` = servicios). Comentarios separadores por bloque.

### Rutas y hreflang ✅
- Idioma por defecto sin prefijo (`/`, `/servicios`); secundario con prefijo (`/en/`, `/en/services`).
- **Slugs traducidos** (`servicios` ↔ `services`). Cada página declara explícitamente su par con `hreflangEs` / `hreflangEn`.
- `x-default` apunta al idioma por defecto.
- El selector de idioma enlaza a la **página equivalente**, no a la home del otro idioma (✅ en servicios; ⚠️ en la home el switch es correcto porque la home es el par).
- URLs mal traducidas redirigidas (`/en/servicios` → `/en/services`).

**Mejoras para la base:**
- ⚠️ Claves duplicadas: `work.moreProjects` aparece dos veces en el mismo objeto (`'+ Proyectos'` y `'OTROS PROYECTOS'`); JS se queda con la última en silencio → el botón mostraba un texto no deseado (ya corregido). ➕ Añadir un check (script o test) que detecte claves duplicadas y claves presentes en `es` pero ausentes en `en`.
- ➕ Tipar `ui.en` contra `UiKey` para que TypeScript avise si falta una traducción:
  ```ts
  const en: Record<UiKey, string> = { … };
  ```
- ➕ Mapa central de rutas (`routes.ts`: `{ services: { es: '/servicios', en: '/en/services' } }`) para no repetir strings en Nav, Work, páginas y hreflang.
- Datos no textuales (tags, URLs de proyectos) también deben venir de una fuente común; hoy están duplicados en cada página.

---

## 5. HTML semántico y jerarquía de encabezados

✅ Aplicado:
- `<header>` (nav) → `<main>` → `<section id="…">` por bloque → `<footer>`.
- **Un solo `<h1>` por página** (nombre/propuesta principal en el Hero).
- `<h2>` por sección, `<h3>` para tarjetas/subelementos. Se corrigió un salto H1→H3 (el título del proyecto destacado pasó a H2).
- Secciones con `id` para navegación por anclas (`#about`, `#work`, `#contact`, `#proyectos-reales`) → también útiles como deep links y fragmentos citables.
- Listas reales (`<ul>`) para stacks/features.
- Enlaces externos con `target="_blank" rel="noopener"`.

⚠️ Revisar en la base:
- En `servicios` el `<header>` de navegación está **dentro** de `<main>`; debe ir fuera (landmarks: `header` / `main` / `footer` hermanos).
- Secciones sin encabezado visible (p.ej. "About", "Stack") deben tener un `<h2>` (aunque sea con estilo de eyebrow) o `aria-labelledby`.
- `</br>` en el footer es HTML inválido → `<br />`.
- ➕ Timeline de experiencia como `<ol>` con `<article>` por entrada y `<time datetime>` para fechas.

---

## 6. Sistema de diseño en CSS

### Tokens ✅

```css
:root {
  --ink: #0a0a0a;   --ink-2: #131312;   --ink-3: #1c1b18;   /* fondos */
  --cream: #f3ece0; --cream-dim: #c8c1b3; --cream-faint: #6b6659; /* texto */
  --accent: #ff5b1f; --accent-2: #ffb38a;                     /* marca */
  --line: rgba(243,236,224,0.12); --line-soft: rgba(243,236,224,0.06);
}
```

Nombres **semánticos por rol** (fondo, texto, acento, línea), no por color literal. Para la base ➕ añadir escala de espaciado (`--space-1…8`), radios, duraciones y easing (`--ease: cubic-bezier(.2,.7,.2,1)` se repite en todo el CSS).

### Tipografía ✅
- Clases utilitarias por familia/rol: `.display`, `.display-tight`, `.mono`, `.serif-it`, `.small`, `.muted`.
- **Tamaños fluidos con `clamp()`**: `font-size: clamp(60px, 18vw, 150px)` en titulares; `clamp(15px, 1.2vw, 17px)` en cuerpo.
- Medida de lectura limitada con `max-width: 45ch–60ch`.
- `line-height` ajustado por rol (0.82–0.95 en display, 1.45–1.65 en cuerpo).

### Contenedor ✅

```css
.wrap { max-width: 1400px; margin: 0 auto; padding: 0 22px; }
@media (min-width: 768px)  { .wrap { padding: 0 40px; } }
@media (min-width: 1200px) { .wrap { padding: 0 64px; } }
```

### Base ✅
`box-sizing: border-box` global, `-webkit-tap-highlight-color: transparent`, `overflow-x: hidden` en body, `-webkit-font-smoothing`.

⚠️ **Organización:** todo el CSS global (~560 líneas, incluidos estilos de secciones) vive en `Layout.astro`. En la base: tokens/base/utilidades en `src/styles/`, y los estilos de cada sección en el `<style>` *scoped* de su componente (como ya hace `Nav.astro`).

⚠️ `text-align: justify` en párrafos genera "ríos" de espacios en móvil; si se usa, acompañar de `hyphens: auto` (y `lang` correcto) o usar `left`.

---

## 7. Responsive

### Enfoque ✅
**Mobile-first**: el estilo base es la columna única; se amplía con `min-width`. Se usan `max-width` solo para ajustes puntuales.

### Breakpoints usados

| Breakpoint | Uso |
|---|---|
| `< 480px` | Ajustes de móvil pequeño (wrap de metadatos, footer en columna) |
| `< 600px` | Móvil: paddings reducidos, CTAs a ancho completo y apilados |
| `600–799px` | Tablet vertical: grids de 2 columnas |
| `≥ 700px` | Grid de stack a 2 columnas |
| `≥ 768px` | Padding de `.wrap`, grids de tarjetas a 3 columnas |
| `≥ 900px` | Nav de escritorio (links + CTA visibles, burger oculto), grids 2 columnas asimétricas |
| `≥ 1000px` | Hero en fila (título + retrato) |
| `≥ 1100px` | Grid de stack a 4 columnas |
| `≥ 1200px` | Padding máximo del contenedor |

➕ En la base, reducir a **4–5 breakpoints con nombre** (`sm 600`, `md 900`, `lg 1200`) y usarlos siempre igual. Aquí hay 700/768/800/900/1000/1100 conviviendo.

### Patrones reutilizables ✅

**Grid progresivo 1 → 2 → 4:**
```css
.grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 700px)  { .grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1100px) { .grid { grid-template-columns: repeat(4, 1fr); } }
```

**Grid asimétrico texto/imagen:**
```css
@media (min-width: 900px) { .featured-grid { grid-template-columns: 1fr 1.2fr; gap: 60px; } }
```

**Dimensiones fluidas de imagen:** `width: clamp(180px, 26vw, 380px)` evita saltos entre breakpoints.

**Nav:** links + CTA ocultos en móvil, burger visible; a partir de 900px al revés. Menú móvil a pantalla con enlaces grandes (28px) y cierre al pulsar un enlace.

**CTAs en móvil:** `flex-direction: column` y `width: 100%` para objetivos táctiles grandes.

**Interacciones solo con ratón:**
```css
@media (hover: none) { .cursor-dot, .cursor-ring { display: none; } }
```

➕ Para la base:
- Considerar **container queries** (`@container`) en tarjetas reutilizables.
- `min-height: 100svh` en hero (en lugar de `100vh`) para evitar el salto de la barra del navegador móvil.
- Probar siempre a 320, 375, 768, 1024, 1440 px.

---

## 8. Imágenes y rendimiento

✅ Aplicado:
- Formato **WebP** en imágenes de proyectos.
- `width` y `height` explícitos en `<img>` → evita CLS.
- `loading="lazy"` + `decoding="async"` en imágenes bajo el pliegue.
- `alt` descriptivo y traducido (`t('work.featuredAlt')`: "AreaSoccer en portátil, tablet y móvil: partidos, estadísticas y perfil de jugador").
- `preconnect` a Google Fonts + `display=swap`.
- Iconos como **SVG inline** (sin librería de iconos ni peticiones extra).
- Efectos decorativos (grano, viñeta) con SVG en data-URI y pseudo-elementos → 0 peticiones.
- Animaciones de entrada con `IntersectionObserver` (clase `.reveal` → `.in`), sin librerías.
- JS mínimo, vanilla, en `<script>` de Astro (se empaqueta y difiere automáticamente).

⚠️ / ➕ Para la base:
- **Retrato del hero en PNG** (`photo.png`, 1086×1448) → es el LCP. Usar `astro:assets` (`<Image>` / `<Picture>`) para generar AVIF/WebP y `srcset` automáticos, y marcarlo `loading="eager" fetchpriority="high"`.
- En `servicios` hay `<img>` sin `width`/`height` → CLS.
- **Fuentes**: 4 familias y ~15 pesos desde Google Fonts, render-blocking. Self-host con `@fontsource` o la API de fuentes de Astro, subset latino, `preload` solo de la fuente del H1, y limitar a 2 familias / 3–4 pesos.
- `prefers-reduced-motion`: desactivar `.reveal`, cursor animado, botones magnéticos y contadores (ver §12).
- Objetivo Core Web Vitals: **LCP < 2,5 s, INP < 200 ms, CLS < 0,1**. Lighthouse móvil ≥ 90 en las 4 categorías antes de lanzar.

---

## 9. SEO técnico

### Indexación ✅
- `meta robots: index, follow`.
- `canonical` absoluto en cada página.
- `robots.txt` con `Sitemap:` apuntando a `sitemap-index.xml`.
- Sitemap automático con `@astrojs/sitemap`.
- `hreflang` bidireccional + `x-default`.
- Redirecciones de URLs obsoletas en `astro.config.mjs`.

⚠️ La redirección de `/en/servicios` además tiene una página con `meta refresh` + canonical. En estático, Astro genera meta refresh, que Google trata como redirección pero no como un 301 real. ➕ En la base: declarar redirects **en `netlify.toml` / `_redirects` con código 301** y eliminar la página puente.

### Arquitectura de contenidos ✅
- **Home = portfolio/marca** (entidad: persona). **Landing = servicios** (intención comercial). Cada una apunta a keywords e intención distintas → no compiten entre sí.
- Enlazado interno: la home enlaza a servicios desde la nav y desde el bloque de proyectos (`/servicios#proyectos-reales`); servicios enlaza de vuelta a la home.
- Anclas con `id` legibles en el idioma de la página.

### On-page ✅
- Keyword principal en `<title>`, `<h1>` / primer párrafo, description y alt de imagen principal.
- Copy orientado a problema → solución → prueba (proyectos reales, cifras) → CTA.
- Prueba social cuantificada (años, proyectos, países, usuarios, uptime).

➕ Para la base:
- Página **404** personalizada (`src/pages/404.astro`) con enlaces a las secciones principales.
- `lastmod` en sitemap.
- Una página por servicio (`/servicios/tiendas-online`) cuando haya contenido suficiente: más superficie de keywords long-tail.
- Página de política de privacidad/cookies si se usa analítica (requisito legal UE).

---

## 10. Datos estructurados (JSON-LD)

Patrón ✅: cada página construye su objeto en el frontmatter con `JSON.stringify` y lo inyecta en el slot `head`:

```astro
<Fragment slot="head">
  <script type="application/ld+json" set:html={jsonLd} />
</Fragment>
```

### Home → `Person` ✅
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Nombre Apellido",
  "jobTitle": "Desarrollador Fullstack Freelance",
  "url": "https://tudominio.com",
  "sameAs": ["https://www.linkedin.com/in/…", "https://github.com/…"],
  "knowsAbout": ["Laravel", "PHP", "Vue.js", "Docker"],
  "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "email": "…" }
}
```

### Servicios → `Person` + `makesOffer` (`Offer` → `Service`) + `BreadcrumbList` ✅
```json
"makesOffer": [
  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Tienda Online", "description": "…" } }
]
```
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio",    "item": "https://tudominio.com" },
    { "@type": "ListItem", "position": 2, "name": "Servicios", "item": "https://tudominio.com/servicios" }
  ]
}
```

**Reglas:**
- Las descripciones del schema salen del **mismo diccionario i18n** que el texto visible → coherencia contenido/marcado (requisito de Google).
- Schema traducido por idioma (`jobTitle`, `knowsAbout`, nombres de servicio).

➕ Para la base:
- Usar `@id` estables (`https://tudominio.com/#person`, `/#website`) y enlazar entidades en un `@graph`: `WebSite` + `Person`/`Organization` + `WebPage` + `BreadcrumbList`.
- Para negocios locales: `LocalBusiness` (o subtipo) con `address`, `geo`, `openingHoursSpecification`, `areaServed`.
- En la versión EN, el breadcrumb debe usar URLs `/en/…` (hoy reutiliza las ES).
- `image` en `Person`/`Organization` (foto o logo) — mejora el knowledge panel.
- Validar con Rich Results Test y validator.schema.org antes de publicar.

---

## 11. GEO — optimización para buscadores de IA

GEO = que ChatGPT, Perplexity, Claude, Google AI Overviews, Copilot… **entiendan, citen y recomienden** la web.

### Acceso de crawlers de IA ✅ (`public/robots.txt`)
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: https://tudominio.com/sitemap-index.xml
```
➕ Añadir explícitamente: `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-User`, `Claude-SearchBot`, `Google-Extended`, `Applebot-Extended`, `Bingbot` (decidir por proyecto si se permite entrenamiento vs. solo búsqueda).

### `llms.txt` ✅ (`public/llms.txt`)
Markdown plano en la raíz con: quién es / qué es el negocio, qué ofrece, stack o catálogo, experiencia/casos, contacto y URLs canónicas. Estructura usada:

```md
# Nombre — Rol

## Who I am
Una frase factual: quién, dónde, especialidad, años.

## What I do
- Servicio 1: qué resuelve
- Servicio 2: …

## Stack
- Backend: …

## Experience
- Cliente (año): resultado concreto

## Contact
- Website / LinkedIn / GitHub / Email
```

⚠️ Mantenerlo sincronizado: aquí faltan las experiencias añadidas después (Oferplay, Centraliza) y los proyectos de servicios. ➕ En la base: **generar `llms.txt` en build** desde el diccionario i18n (endpoint `src/pages/llms.txt.ts`), así nunca se queda desfasado.

### Contenido citable ✅ / ➕
- ✅ Frases factuales autocontenidas con entidad + dato ("6+ años", "100 usuarios", "98% uptime", "1ª posición en Google").
- ✅ Casos reales con cliente, problema, solución y resultado (timeline de experiencia).
- ➕ Bloques **pregunta → respuesta** (FAQ) en servicios: "¿Cuánto cuesta una tienda online?", "¿Cuánto tarda?". Los LLM extraen pasajes de 40–60 palabras que responden directamente.
- ➕ Definiciones claras al inicio de cada sección ("Una tienda online a medida es…").
- ➕ Fechas visibles de actualización.

### Señales de entidad ✅ / ⚠️
- ✅ `sameAs` a LinkedIn y GitHub; mismo nombre, rol y foto en todas partes.
- ⚠️ Dominio inconsistente (`netlify.app` en canonical/sitemap vs `alexcastro.dev` en schema/llms.txt). Para una IA son dos entidades distintas. Una sola URL canónica en todo.
- ➕ Menciones externas (directorios, perfiles, artículos) enlazando al dominio principal.

### Renderizado ✅
Contenido en **HTML estático** (Astro SSG): los crawlers de IA no ejecutan JS en su mayoría. Nunca depender de JS para mostrar texto importante. ⚠️ Ojo: `.reveal` arranca con `opacity: 0`; el texto está en el HTML (bien para bots), pero si el JS falla el usuario no lo ve. ➕ Añadir la clase de ocultación solo cuando hay JS (`<html class="js">`) o usar `@media (scripting: enabled)`.

---

## 12. Accesibilidad

✅ Aplicado:
- `lang` en `<html>` según idioma.
- `aria-label` traducido en el botón hamburguesa.
- `alt` en imágenes de contenido.
- Contraste alto (crema sobre casi negro).
- Cursor personalizado desactivado en dispositivos táctiles.

➕ Para la base (faltan aquí):
- `aria-expanded` + `aria-controls` en el burger, y cerrar menú con `Esc`.
- Enlace "Saltar al contenido" (`<a href="#main" class="skip-link">`).
- Estilos `:focus-visible` visibles en enlaces y botones (hoy no existen).
- `@media (prefers-reduced-motion: reduce)` que anule transiciones, reveal, magnetic y contadores:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
    .reveal { opacity: 1; transform: none; }
  }
  ```
- SVG decorativos con `aria-hidden="true"`; SVG que son el único contenido de un enlace, con `aria-label`.
- Verificar contraste de `--cream-faint` (#6b6659 sobre #0a0a0a ≈ 3,5:1) → insuficiente para texto pequeño (mínimo 4,5:1). Subirlo o reservarlo a elementos decorativos.
- Enlaces de idioma con `hreflang` y `lang` en el propio `<a>`; `aria-current="page"` en el activo.

---

## 13. Analítica

✅ Google Analytics 4 con `gtag.js` en `is:inline` + `async`.

➕ Para la base:
- ID en variable de entorno (`PUBLIC_GA_ID`), no hardcodeado.
- **Consentimiento** (RGPD): Consent Mode v2 con `analytics_storage: 'denied'` por defecto y banner, o alternativa sin cookies (Plausible, Umami, Cloudflare Web Analytics).
- Eventos de conversión en CTAs: clic en WhatsApp, email, descarga de CV/dossier.
- Cargar la analítica tras interacción o `requestIdleCallback` para no penalizar INP/LCP.

---

## 14. Seguridad y despliegue (Netlify)

➕ No existe `netlify.toml` en este proyecto. Plantilla recomendada:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/en/servicios"
  to = "/en/services"
  status = 301

[[redirects]]
  from = "https://tudominio.netlify.app/*"
  to = "https://tudominio.com/:splat"
  status = 301
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

- ➕ Añadir `Content-Security-Policy` ajustada a los orígenes reales (Google Fonts, GA).
- Redirigir el subdominio `*.netlify.app` al dominio propio para no duplicar contenido.
- Datos de contacto (email, teléfono de WhatsApp) en un único fichero de config; valorar ofuscar el email frente a scrapers.

---

## 15. Errores detectados y lecciones

Historial de la auditoría SEO (puntuación inicial 58/100) y hallazgos al redactar este documento:

| # | Problema | Impacto | Solución aplicada / recomendada |
|---|---|---|---|
| 1 | `hreflang` hardcoded a `/` en todas las páginas | Alternates contradictorios en `/servicios` | ✅ Props `hreflangEs`/`hreflangEn` + URLs absolutas |
| 2 | Sin sitemap | Descubrimiento lento | ✅ `@astrojs/sitemap` |
| 3 | Sin `og:image`, `og:url`, Twitter image | Previews pobres al compartir | ✅ Meta añadidos · ⚠️ falta el fichero `og-image.jpg` |
| 4 | Slug EN en español (`/en/servicios`) | URL no localizada | ✅ `/en/services` + redirect |
| 5 | Schema de servicios mal tipado | Sin elegibilidad para rich results | ✅ `makesOffer` → `Offer` → `Service` + Breadcrumb |
| 6 | Salto de encabezado H1 → H3 | Jerarquía rota | ✅ H2 |
| 7 | Imagen hero sin dimensiones | CLS | ✅ `width`/`height` |
| 8 | Sin `<main>` en servicios | Landmarks incompletos | ✅ Añadido · ⚠️ el header quedó dentro |
| 9 | Sin `robots.txt` para IA ni `llms.txt` | Invisibilidad en GEO | ✅ Ambos creados · ⚠️ `llms.txt` desactualizado |
| 10 | Dominio `site` ≠ dominio del schema | Entidad duplicada | ⚠️ Unificar en `site.ts` |
| 11 | Clave i18n duplicada (`work.moreProjects`) | Texto erróneo silencioso | ✅ Duplicado eliminado · ➕ validar claves en build |
| 12 | Páginas por idioma duplicadas (~600 líneas) | Divergencia entre idiomas | ⚠️ Componente de página con prop `lang` |
| 13 | Fuentes externas render-blocking | LCP | ⚠️ Self-host + subset |
| 14 | Retrato en PNG | LCP / peso | ⚠️ `astro:assets` → AVIF/WebP |
| 15 | Sin headers de seguridad | Auditorías / confianza | ⚠️ `netlify.toml` |
| 16 | Sin `prefers-reduced-motion` ni `:focus-visible` | Accesibilidad | ⚠️ Ver §12 |

**Lección general:** los fallos venían de **datos repetidos en varios sitios** (dominio, rutas, traducciones, páginas por idioma). La web base debe tener **una fuente única** para cada dato y derivar todo lo demás (canonical, hreflang, schema, sitemap, llms.txt).

---

## 16. Checklist de lanzamiento

**Configuración**
- [ ] `site` = dominio definitivo; `SITE_URL` único en config
- [ ] Redirect 301 `*.netlify.app` → dominio propio
- [ ] `netlify.toml` con headers de seguridad y caché

**SEO**
- [ ] Title (50–60) y description (140–160) únicos por página e idioma
- [ ] Un `<h1>` por página, jerarquía sin saltos
- [ ] Canonical absoluto en todas las páginas
- [ ] hreflang recíproco + `x-default`, slugs traducidos
- [ ] Sitemap con alternates i18n enviado a Search Console y Bing Webmaster Tools
- [ ] `og-image.jpg` 1200×630 existe y se ve en el validador de LinkedIn/X/WhatsApp
- [ ] 404 personalizada
- [ ] JSON-LD validado (Rich Results Test + schema.org validator)

**GEO**
- [ ] `robots.txt` permite los bots de IA elegidos
- [ ] `llms.txt` generado y actualizado
- [ ] Nombre, rol, URL y `sameAs` idénticos en web, schema, llms.txt y perfiles externos
- [ ] Al menos un bloque FAQ con respuestas directas en páginas comerciales
- [ ] Contenido clave visible sin JS

**Responsive / rendimiento**
- [ ] Probado en 320 / 375 / 768 / 1024 / 1440 px, sin scroll horizontal
- [ ] Todas las `<img>` con `width`/`height` y `alt`; lazy salvo LCP
- [ ] Imagen LCP con `fetchpriority="high"` en AVIF/WebP
- [ ] Fuentes self-hosted, ≤ 2 familias
- [ ] Lighthouse móvil ≥ 90 en Performance, Accessibility, Best Practices, SEO

**Accesibilidad**
- [ ] Navegable con teclado, foco visible, skip-link
- [ ] Burger con `aria-expanded` y cierre con `Esc`
- [ ] `prefers-reduced-motion` respetado
- [ ] Contraste ≥ 4,5:1 en texto

**Legal / analítica**
- [ ] Consentimiento de cookies o analítica sin cookies
- [ ] Política de privacidad
- [ ] Eventos de conversión en CTAs

---

## 17. Plantillas de arranque

### `src/config/site.ts` ➕
```ts
export const SITE = {
  url: 'https://tudominio.com',
  name: 'Nombre Apellido',
  email: 'hola@tudominio.com',
  whatsapp: '34600000000',
  social: {
    linkedin: 'https://www.linkedin.com/in/…',
    github: 'https://github.com/…',
  },
  ogImage: '/og-image.jpg',
} as const;
```

### `src/i18n/routes.ts` ➕
```ts
import type { Lang } from './ui';

export const routes = {
  home:     { es: '/',          en: '/en/' },
  services: { es: '/servicios', en: '/en/services' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof routes;
export const path = (key: RouteKey, lang: Lang) => routes[key][lang];
```

Uso en una página:
```astro
<Layout
  lang={lang}
  title={t('sv.meta.title')}
  description={t('sv.meta.desc')}
  hreflangEs={path('services', 'es')}
  hreflangEn={path('services', 'en')}
>
```

### Página por idioma sin duplicar ➕
```astro
---
// src/pages/en/services.astro
import ServicesPage from '../../components/pages/ServicesPage.astro';
---
<ServicesPage lang="en" />
```

### `src/pages/llms.txt.ts` ➕
```ts
import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { useTranslations } from '../i18n/utils';

export const GET: APIRoute = () => {
  const t = useTranslations('en');
  const body = [
    `# ${SITE.name} — ${t('hero.badge')}`,
    '',
    '## What I do',
    `- ${t('sv.svc1.badge')}: ${t('sv.svc1.desc')}`,
    `- ${t('sv.svc2.badge')}: ${t('sv.svc2.desc')}`,
    '',
    '## Contact',
    `- Website: ${SITE.url}`,
    `- Email: ${SITE.email}`,
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
```

### Nav móvil accesible ➕
```astro
<button class="nav-burger" aria-label={t('nav.menuLabel')}
        aria-expanded="false" aria-controls="nav-mobile">…</button>
<div id="nav-mobile" class="nav-mobile" hidden>…</div>

<script>
  const burger = document.querySelector<HTMLButtonElement>('.nav-burger')!;
  const menu = document.getElementById('nav-mobile')!;
  const toggle = (open: boolean) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };
  burger.addEventListener('click', () => toggle(menu.hidden));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
</script>
```

### Reveal progresivo seguro ➕
```html
<script is:inline>document.documentElement.classList.add('js')</script>
```
```css
.js .reveal { opacity: 0; transform: translateY(24px); transition: opacity .9s var(--ease), transform .9s var(--ease); }
.js .reveal.in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .js .reveal { opacity: 1; transform: none; transition: none; } }
```
