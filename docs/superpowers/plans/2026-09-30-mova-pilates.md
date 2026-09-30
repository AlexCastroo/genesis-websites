# MOVA Pilates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replicar el diseño de Google Stitch «MOVA» sobre la web base, en español, manteniendo todas sus garantías (SEO, JSON-LD, GEO, a11y, rendimiento, consentimiento, Docker, tests).

**Architecture:** Se reutiliza la arquitectura de la base (config → i18n → colecciones → `planPages` → vistas). Cambian valores de tokens, tipografías, contenido y vistas; se añaden colecciones (`plans`, `schedule`, `team`, `testimonials`, `spaces`), una página estática (`pricing`), bloques MOVA y un módulo de pestañas accesibles. Lógica nueva en funciones puras con Vitest.

**Tech Stack:** el de la base (Astro 7, TS 6, pnpm 11, Vitest 5, Fonts API, `astro:assets`).

**Spec:** `docs/superpowers/specs/2026-09-30-mova-pilates-design.md` (y la spec base `docs/superpowers/specs/2026-09-30-web-base-design.md`).

**Referencia visual:** `docs/design/stitch/` — HTML original de Stitch por página (`inicio.html`, `el-estudio.html`, `disciplinas.html`, `precios-y-horarios.html`), su esquema textual (`*.outline.txt`, con TODOS los textos a usar) y capturas troceadas (`screens/<pagina>-<n>.jpg`, 800 px de ancho).

## Nota sobre el nivel de detalle

Las funciones puras, schemas, configuración y tests llevan el código completo. Los componentes visuales (`.astro` de vistas y bloques) se especifican por **estructura, contenido y referencia exacta** a la sección del HTML de Stitch que transcriben (clases Tailwind → CSS con tokens). Motivo: el HTML de Stitch ya es el código fuente del diseño (≈185 KB); copiarlo aquí duplicaría la fuente. Regla de transcripción, obligatoria en todos los componentes visuales:

1. Estructura y textos: los del `*.outline.txt` / HTML de Stitch, salvo los cambios de la spec (errata «Instructorass», precio 18 €, sin perfil/newsletter/test).
2. Cada clase Tailwind se traduce a CSS *scoped* usando **solo tokens semánticos** (nunca hex): `bg-surface-container-low` → `var(--color-bg-subtle)`, `rounded-lg` (2rem) → `var(--radius-lg)`, `text-label-caps` → clase `.eyebrow`, `font-display-hero-italic` → `.display-title__accent`, etc. (tabla en Task 2).
3. Textos visibles → diccionario (`src/i18n/ui/es.ts`) o colecciones; nunca literales en el `.astro`.
4. Imágenes → `<Picture>`/`<Image>` de `astro:assets` con los ficheros de `src/assets/mova/` (Task 1) y `alt` en español.
5. Semántica y a11y de la base: un `<h1>`, `aria-labelledby` en secciones, decorativos `aria-hidden`, iconos SVG de `Icon.astro`.
6. Verificación visual por tarea: captura headless de la página a 1280 px y 375 px (`scripts/screenshot.ts`, Task 1) comparada a ojo con `screens/*.jpg`.

## Global Constraints

- Todas las de `docs/superpowers/plans/2026-09-30-web-base.md` (Global Constraints) siguen vigentes.
- Solo idioma `es`. Slugs: `el-estudio`, `disciplinas`, `precios-y-horarios`, `contacto`, `preguntas-frecuentes`, `blog`, `legal`.
- Paleta y radios: solo los tokens de la spec §2.1. Ningún hex fuera de `tokens.css` (salvo SVG decorativos que usen `currentColor`).
- Fuentes: Plus Jakarta Sans (300/400/500/600) + EB Garamond (400 normal/cursiva). Nada de Google Fonts, Tailwind ni Material Symbols en runtime.
- Precio de la clase de prueba: 18 €, leído de `plans` (fuente única).
- Sin JS todo el contenido visible (filtro y pestañas incluidos).
- `pnpm check`, `pnpm build`, `pnpm verify` en verde al final de cada tarea; Lighthouse móvil ≥ 90 al final.

## Review Focus

1. **Sin JS**: filtro, toggle de planes y pestañas de horario deben mostrar todo el contenido, con encabezados, y los controles `.js-only` ocultos. → Test manual por `scripts/screenshot.ts` con JS desactivado (Task 9) y `auditHtml` (un solo h1).
2. **Horario con días sin clases / domingo**: la pestaña preseleccionada nunca apunta a un día sin panel. → Test `todayTab` (Task 3).
3. **Plazas 0/1/N** muestran estado y acción correctos («Anotarme» vs «Reservar», «Última plaza», «Completo»). → Test `spotsStatus` (Task 3).
4. **Mensaje de WhatsApp con caracteres especiales** (tildes, `&`, `+`) llega bien codificado. → Test `whatsappLink` (Task 3).
5. **Formulario sin endpoint**: Precios y Horarios y Contacto siguen ofreciendo una vía de contacto (WhatsApp/teléfono/email) sin huecos en el layout. → Verificación en Task 9 con build sin `PUBLIC_CONTACT_ENDPOINT`.

---

## File Structure (cambios respecto a la base)

```
docs/design/stitch/                 referencia (ya copiada)
scripts/
  fetch-stitch-images.ts            descarga imágenes Stitch → src/assets/mova/
  screenshot.ts                     capturas headless (Chrome) para comparar
src/
  assets/mova/*.jpg                 26 imágenes
  config/site.ts · nav.ts           MOVA
  i18n/config.ts · routes.ts        solo es, + pricing
  i18n/ui/es.ts                     reescrito (MOVA)       — en.ts eliminado
  content.config.ts                 services ampliado + plans, schedule, team, testimonials, spaces
  content/{services,blog,faq,legal,plans,schedule,team,testimonials,spaces}/es/*
  lib/
    whatsapp.ts (+test)             whatsappLink
    schedule.ts (+test)             groupSchedule, spotsStatus, todayTab, DAY_ORDER
    disciplines.ts (+test)          disciplineFilters, CATEGORY_ORDER
    schema.ts (+test)               serviceNode offers, offerCatalogNode
    tabs-client.ts                  pestañas ARIA (navegador)
    filter-client.ts                filtro de disciplinas (navegador)
    queries.ts                      + getPlans, getSchedule, getTeam, getTestimonials, getSpaces
  styles/tokens.css · base.css · utilities.css
  components/
    ui/DisplayTitle.astro · Pill.astro · Icon.astro (ampliado) · Button.astro (variantes)
    layout/Header.astro · Footer.astro
    blocks/PageHeader.astro · CtaBand.astro · PlanCard.astro · ScheduleBoard.astro
           DisciplineCard.astro · RequestForm.astro · StatStrip.astro
  views/HomeView · AboutView · ServicesView · ServiceDetailView · PricingView (nueva)
        ContactView · FaqView · BlogView · PostView · LegalView  (reestilizadas)
  pages/[...path].astro             + rama pricing
```

---

### Task 1: Material de referencia, imágenes, idioma único y configuración MOVA

**Files:**
- Create: `scripts/fetch-stitch-images.ts`, `scripts/screenshot.ts`, `src/assets/mova/*.jpg`
- Modify: `src/i18n/config.ts`, `src/i18n/routes.ts`, `src/i18n/ui/index.ts`, `src/config/site.ts`, `src/config/nav.ts`, `src/lib/pages.ts` (`STATIC_PAGES` + `pricing`), `package.json` (script `screenshot`), `.prettierignore` (+ `docs/design`)
- Delete: `src/i18n/ui/en.ts`, `src/content/*/en/`
- Test: `src/i18n/utils.test.ts`, `src/lib/pages.test.ts` (siguen pasando; `pricing` cuenta en `STATIC_PAGES`)

**Interfaces:**
- Produces: `routes.pricing = { es: 'precios-y-horarios' }`; `routes.about.es = 'el-estudio'`; `routes.services.es = 'disciplinas'`; `NavItem` pasa a `{ route?: RouteKey; href?: string; label: UiKey; external?: boolean }`; `secondaryNav: NavItem[]`; `SITE` MOVA; `pnpm screenshot <path> [--width=1280] [--no-js] [--out=file]`.

- [ ] **Step 1: `scripts/fetch-stitch-images.ts`** — lee `docs/design/stitch/images.json` (`{ i, screen, alt, src }[]`), omite índices 0 (logo) y 1 (avatar), descarga cada `src` con `fetch` (añadiendo `=w1600` si la URL es de `lh3.googleusercontent.com` y no lleva tamaño), la re-codifica con sharp a JPEG q80, ancho máx. 1600, y la guarda en `src/assets/mova/<nombre>.jpg` según este mapa (índice → nombre):

```ts
const NAMES: Record<number, string> = {
  2: 'hero-live-preview', 3: 'manifesto-group', 4: 'practice-reformer', 5: 'practice-mat',
  6: 'practice-restorative', 7: 'ritual-tea', 8: 'ritual-dressing-room', 9: 'hero-studio',
  10: 'arch-studio', 11: 'studio-main-room', 12: 'studio-tea-detail', 13: 'founder',
  14: 'team-clara', 15: 'team-elena', 16: 'team-marina', 17: 'space-reformer-room',
  18: 'space-dressing-room', 19: 'space-mat-room', 20: 'space-tea-lounge',
  21: 'discipline-reformer-core', 22: 'discipline-mat-flow', 23: 'discipline-jumpboard',
  24: 'discipline-maternity', 25: 'discipline-yin', 26: 'pricing-savasana', 27: 'pricing-reformer',
};
```

Imprime `n imágenes → src/assets/mova/`. Si una descarga falla, termina con código 1 indicando cuál.
(Verificar primero que 9 y 10 son hero y arco mirando `inicio.html`; si el orden de los fondos CSS es el inverso, intercambiar nombres y registrarlo como Ruling.)

- [ ] **Step 2: `scripts/screenshot.ts`** — usa el Chrome que ya instaló Lighthouse (`chrome-launcher` → `Launcher.getInstallations()[0]`) en modo `--headless=new --screenshot=<out> --window-size=<width>,<height> --hide-scrollbars [--blink-settings=scriptEnabled=false]` contra `http://localhost:4321<path>`. Por defecto `width=1280`, `height=4000`, `out=.superpowers/shots/<slug>-<width>[-nojs].png`. Añadir `"screenshot": "tsx scripts/screenshot.ts"` a `package.json`. (Herramienta de verificación local; si `chrome-launcher` no está disponible como dependencia, instalarla como devDependency.)

- [ ] **Step 3: Idioma único** — `locales` solo `es`; `ui/index.ts` → `{ es }`; `routes.ts`:

```ts
export const routes = {
  home: { es: '' },
  about: { es: 'el-estudio' },
  services: { es: 'disciplinas' },
  pricing: { es: 'precios-y-horarios' },
  contact: { es: 'contacto' },
  faq: { es: 'preguntas-frecuentes' },
  blog: { es: 'blog' },
  legal: { es: 'legal' },
} as const satisfies Record<string, Record<Lang, string>>;
```

`git rm -r src/i18n/ui/en.ts src/content/*/en`. `STATIC_PAGES` añade `'pricing'` (tras `'services'`). En `[...path].astro` añadir temporalmente `{page.kind === 'pricing' && <ServicesView {...common} />}` para no romper el build hasta Task 9 (Ruling temporal).

- [ ] **Step 4: `src/config/site.ts`** — valores MOVA (spec §3.1):

```ts
export const SITE: SiteConfig = {
  url: 'https://movapilates.example',
  name: 'MOVA',
  legalName: 'MOVA Pilates & Wellness Studio S.L.',
  taxId: 'B00000000',
  entity: { schemaType: 'ExerciseGym', local: true, priceRange: '€€', areaServed: ['Madrid'] },
  contact: { email: 'hola@movapilates.example', phone: '+34600000000', whatsapp: '34600000000' },
  address: { street: 'Calle Serrano 45', locality: 'Madrid', region: 'Madrid', postalCode: '28001', country: 'ES' },
  geo: { lat: 40.4271, lng: -3.6868 },
  openingHours: [
    { days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '07:30', closes: '21:00' },
    { days: ['Sa'], opens: '09:00', closes: '14:00' },
  ],
  social: { instagram: 'https://www.instagram.com/movapilates.example' },
  logo: '/logo.png',
  ogImage: '/og-default.jpg',
  themeColor: '#fcf9f4',
  aiTraining: true,
};
```

- [ ] **Step 5: `src/config/nav.ts`**

```ts
export interface NavItem {
  route?: RouteKey;
  href?: string;
  label: UiKey;
  external?: boolean;
}
export const mainNav: NavItem[] = [
  { route: 'home', label: 'nav.home' },
  { route: 'about', label: 'nav.about' },
  { route: 'services', label: 'nav.services' },
  { route: 'pricing', label: 'nav.pricing' },
];
/** Right-hand header links. WhatsApp href is built from SITE in the Header. */
export const secondaryNav: NavItem[] = [
  { href: 'whatsapp', label: 'nav.whatsapp', external: true },
  { route: 'contact', label: 'nav.contact' },
];
export const ctaNav: NavItem = { route: 'pricing', href: '#solicitud', label: 'cta.trial' };
```

(Header/Footer se adaptan en Task 5; hasta entonces ajustar su uso mínimo para compilar.)

- [ ] **Step 6: Verificar** — `pnpm tsx scripts/fetch-stitch-images.ts` (26 ficheros); `pnpm check` (tests de i18n/pages pasan con 1 idioma; los 2 skipped siguen skipped); `pnpm build`.

- [ ] **Step 7: Commit** `feat(mova): single-locale Spanish config, MOVA business data and Stitch assets`

---

### Task 2: Sistema de diseño MOVA (tokens, fuentes, DisplayTitle, iconos, botones)

**Files:**
- Modify: `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/utilities.css`, `astro.config.ts` (fonts), `src/layouts/BaseLayout.astro` (`<Font>`), `src/components/ui/Icon.astro`, `src/components/ui/Button.astro`
- Create: `src/components/ui/DisplayTitle.astro`, `src/components/ui/Pill.astro`

**Interfaces:**
- Produces: tokens nuevos `--color-surface-strong`, `--color-eyebrow`, `--color-highlight`, `--font-serif`, `--radius-xl`; clases `.eyebrow`, `.display-title`, `.display-title__accent`, `.js-only`, `.btn--light`, `.btn--ghost-light`, `.btn--pill`; `DisplayTitle { level: 1|2|3; title: string; accent?: string; eyebrow?: string; align?: 'start'|'center'; size?: 'hero'|'section' }`; `Pill { icon?: IconName; tone?: 'light'|'glass'|'highlight' }`; `Button` variantes `'primary'|'secondary'|'ghost'|'light'|'ghost-light'`.

- [ ] **Step 1: `tokens.css`** — sustituir valores (spec §2.1). Añadir `--font-serif: var(--font-garamond), 'EB Garamond', Georgia, serif;` y `--font-sans: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;`. Escala ajustada:

```css
--step--1: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem);
--step-0: clamp(0.9375rem, 0.9rem + 0.2vw, 1.0625rem);
--step-1: clamp(1.125rem, 1.07rem + 0.25vw, 1.25rem);
--step-2: clamp(1.375rem, 1.26rem + 0.55vw, 1.625rem);
--step-3: clamp(1.75rem, 1.5rem + 1.1vw, 2.25rem);
--step-4: clamp(2.125rem, 1.7rem + 1.9vw, 3.25rem);
--step-5: clamp(2.25rem, 1.6rem + 2.9vw, 4rem);
```

Tabla de traducción Tailwind→token (para todas las tareas visuales):

| Stitch | Token |
| --- | --- |
| `bg-background`, `bg-surface` | `--color-bg` |
| `bg-surface-container-low` | `--color-bg-subtle` |
| `bg-surface-container` | `--color-bg-muted` |
| `bg-surface-container-high(est)` | `--color-surface-strong` |
| `bg-surface-container-lowest` | `--color-surface` |
| `text-on-surface` | `--color-text` |
| `text-on-surface-variant` | `--color-text-muted` |
| `bg-primary` / `text-primary` | `--color-bg-inverse` / `--color-text` (títulos) |
| `bg-primary-container` | `--color-accent` |
| `text-secondary` | `--color-eyebrow` |
| `bg-secondary-container` | `--color-highlight` |
| `border-outline-variant` | `--color-border` |
| `rounded` / `rounded-lg` / `rounded-xl` / `rounded-full` | `--radius-md` / `--radius-lg` / `--radius-xl` / `--radius-full` |
| `px-margin` (1.25rem) · `md:px-margin-tablet` (3rem) · `lg:px-margin-desktop` (5rem) | `--container-pad` fluido (`clamp(1.25rem, 0.2rem + 4.5vw, 5rem)`) |
| `space-xs…2xl` | `--space-3xs…2xl` más cercano |

`--container-max: 80rem` (Stitch usa ancho completo con márgenes de 5 rem en 1280).

- [ ] **Step 2: Fuentes** — en `astro.config.ts` sustituir Inter por:

```ts
fonts: [
  { provider: fontProviders.fontsource(), name: 'Plus Jakarta Sans', cssVariable: '--font-jakarta',
    weights: [300, 400, 500, 600], styles: ['normal'], subsets: ['latin'], fallbacks: ['sans-serif'] },
  { provider: fontProviders.fontsource(), name: 'EB Garamond', cssVariable: '--font-garamond',
    weights: [400], styles: ['normal', 'italic'], subsets: ['latin'], fallbacks: ['serif'] },
],
```

`BaseLayout`: `<Font cssVariable="--font-jakarta" preload />` y `<Font cssVariable="--font-garamond" />`.

- [ ] **Step 3: `base.css` / `utilities.css`** — `h1,h2`: `font-weight: 300; text-transform: uppercase; letter-spacing: 0.04em; line-height: 1.12`. `h3,h4`: `font-weight: 400; letter-spacing: 0.02em`. `.eyebrow` (0.75rem/600/0.12em/uppercase/`--color-eyebrow`). `.js-only { display: none } .js .js-only { display: revert }`. Botones: `.btn` pasa a `border-radius: var(--radius-full)`, `font-size: var(--step--1)`, `letter-spacing: 0.02em`; `.btn--primary` (`--color-accent` → hover `--color-bg-inverse`, sombra `0 4px 16px rgb(74 59 50 / 0.12)`); `.btn--light` (fondo `--color-surface`, texto `--color-text`, para fondos oscuros/foto); `.btn--ghost-light` (fondo `rgb(255 255 255 / 0.08)`, texto `--color-text-inverse`, borde translúcido); `.btn--secondary` (fondo `--color-bg-muted`, texto `--color-text`). `::selection` con `--color-highlight`.

- [ ] **Step 4: `DisplayTitle.astro`**

```astro
---
interface Props {
  level?: 1 | 2 | 3;
  title: string;
  accent?: string;
  eyebrow?: string;
  id?: string;
  align?: 'start' | 'center';
  size?: 'hero' | 'section';
  tone?: 'default' | 'inverse';
}
const { level = 2, title, accent, eyebrow, id, align = 'start', size = 'section', tone = 'default' } = Astro.props;
const Heading = `h${level}` as 'h1' | 'h2' | 'h3';
---

<div class:list={['display-title', `display-title--${align}`, `display-title--${size}`, `display-title--${tone}`]}>
  {eyebrow && <p class="eyebrow">{eyebrow}</p>}
  <Heading id={id} class="display-title__heading">
    <span class="display-title__main">{title}</span>
    {accent && <span class="display-title__accent">{accent}</span>}
  </Heading>
</div>
```

Estilos: `__main` hereda el h (uppercase, light); `--hero` usa `--step-5`, `--section` `--step-4`; `__accent` `display:block; font-family: var(--font-serif); font-style: italic; text-transform: none; letter-spacing: 0.01em; font-size: 0.72em; color: var(--color-eyebrow)`; `--inverse` en blanco / `--color-text-inverse-muted` para el acento.

- [ ] **Step 5: `Pill.astro`** — `<span class="pill pill--{tone}">{icon && <Icon .../>}<slot/></span>`: radio completo, padding `0.375rem 0.875rem`, eyebrow pequeño; `light` (`--color-bg-muted`), `glass` (blanco 85 % + blur, para sobre foto), `highlight` (`--color-highlight`, texto `--color-bg-inverse`).

- [ ] **Step 6: Iconos** — ampliar `paths` en `Icon.astro` con: `spa` (flor de loto simple), `group` (dos personas), `coffee` (taza), `sun`, `moon`, `sunrise`, `air` (tres líneas onduladas), `leaf`, `check`, `check-circle`, `star`, `infinity`, `user`, `schedule` (reloj = `clock` existente, alias), `tune` (deslizadores), `hanger`, `shield-check`, `arrow-down`, `arrow-up-right`, `chevron-down`, `whatsapp` (bocadillo con auricular). Trazos 24×24, `stroke-width` 1.5 para iconos grandes (añadir prop `strokeWidth?: number`, por defecto 2).

- [ ] **Step 7: Verificar y commit** — `pnpm check && pnpm build && pnpm verify`; captura de `/` a 1280 para confirmar fuentes y paleta. Commit `feat(mova): design tokens, typography and base UI components`.

---

### Task 3: Funciones puras nuevas (TDD)

**Files:**
- Create: `src/lib/whatsapp.ts`, `src/lib/schedule.ts`, `src/lib/disciplines.ts` (+ `*.test.ts`)
- Modify: `src/lib/schema.ts`, `src/lib/schema.test.ts`

**Interfaces:**
- Produces:
  - `whatsappLink(phone: string, message?: string): string`
  - `type Band = 'morning' | 'midday' | 'evening'`; `interface Slot { time: string; className: string; instructor: string; band: Band; spots: number }`; `interface DaySchedule { day: DayCode; slots: Slot[] }`; `DAY_ORDER: DayCode[]` (`Mo…Sa`); `BAND_ORDER: Band[]`; `groupSchedule(days: DaySchedule[]): { day: DayCode; bands: { band: Band; slots: Slot[] }[] }[]`; `spotsStatus(spots: number): { tone: 'full' | 'last' | 'open'; action: 'waitlist' | 'book' }`; `todayTab(date: Date, available: DayCode[]): DayCode`
  - `type DisciplineCategory = 'reformer' | 'mat' | 'prenatal' | 'restorative'`; `CATEGORY_ORDER`; `disciplineFilters(categories: DisciplineCategory[]): DisciplineCategory[]`
  - `serviceNode(site, { path, name, description, price?: number })` añade `offers`; `offerCatalogNode(site, { path, name, plans: { name: string; description: string; price: number; unit?: string }[] })`

- [ ] **Step 1: Tests que fallan**

`src/lib/whatsapp.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { whatsappLink } from './whatsapp';

describe('whatsappLink', () => {
  it('keeps only digits of the phone number', () => {
    expect(whatsappLink('+34 600 000 000')).toBe('https://wa.me/34600000000');
  });

  it('url-encodes the prefilled message, including accents and symbols', () => {
    expect(whatsappLink('34600000000', 'Hola, quiero reservar Mat & Core el miércoles a las 09:00 +info')).toBe(
      'https://wa.me/34600000000?text=Hola%2C%20quiero%20reservar%20Mat%20%26%20Core%20el%20mi%C3%A9rcoles%20a%20las%2009%3A00%20%2Binfo',
    );
  });

  it('omits the text parameter for an empty message', () => {
    expect(whatsappLink('34600000000', '')).toBe('https://wa.me/34600000000');
  });
});
```

`src/lib/schedule.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { groupSchedule, spotsStatus, todayTab, type DaySchedule } from './schedule';

const slot = (time: string, band: 'morning' | 'midday' | 'evening', spots = 3) => ({
  time, band, spots, className: 'Reformer', instructor: 'Ana',
});

describe('groupSchedule', () => {
  it('orders days Mo→Sa, bands morning→evening, slots by time, and drops empty bands', () => {
    const days: DaySchedule[] = [
      { day: 'Tu', slots: [slot('18:45', 'evening'), slot('07:30', 'morning')] },
      { day: 'Mo', slots: [slot('10:30', 'morning'), slot('09:00', 'morning')] },
    ];
    const grouped = groupSchedule(days);
    expect(grouped.map((d) => d.day)).toEqual(['Mo', 'Tu']);
    expect(grouped[0]!.bands).toHaveLength(1);
    expect(grouped[0]!.bands[0]!.slots.map((s) => s.time)).toEqual(['09:00', '10:30']);
    expect(grouped[1]!.bands.map((b) => b.band)).toEqual(['morning', 'evening']);
  });

  it('drops days without slots', () => {
    expect(groupSchedule([{ day: 'Sa', slots: [] }])).toEqual([]);
  });
});

describe('spotsStatus', () => {
  it.each([
    [0, { tone: 'full', action: 'waitlist' }],
    [1, { tone: 'last', action: 'book' }],
    [4, { tone: 'open', action: 'book' }],
  ])('%i spots → %o', (spots, expected) => {
    expect(spotsStatus(spots)).toEqual(expected);
  });

  it('treats negative or fractional input defensively', () => {
    expect(spotsStatus(-2)).toEqual({ tone: 'full', action: 'waitlist' });
    expect(spotsStatus(1.5).tone).toBe('open');
  });
});

describe('todayTab', () => {
  const all = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
  it('selects the current weekday', () => {
    expect(todayTab(new Date('2026-09-30T10:00:00'), [...all])).toBe('We');
  });

  it('falls back to the first available day on Sunday', () => {
    expect(todayTab(new Date('2026-10-04T10:00:00'), [...all])).toBe('Mo');
  });

  it('falls back to the first available day when today has no classes', () => {
    expect(todayTab(new Date('2026-10-03T10:00:00'), ['Mo', 'Tu'])).toBe('Mo');
  });
});
```

`src/lib/disciplines.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { disciplineFilters } from './disciplines';

describe('disciplineFilters', () => {
  it('returns each present category once, in the fixed display order', () => {
    expect(disciplineFilters(['restorative', 'reformer', 'mat', 'reformer'])).toEqual([
      'reformer', 'mat', 'restorative',
    ]);
  });

  it('returns nothing for no disciplines', () => {
    expect(disciplineFilters([])).toEqual([]);
  });
});
```

Añadir a `src/lib/schema.test.ts`:
```ts
describe('offers', () => {
  it('adds an EUR Offer to services with a price', () => {
    expect(serviceNode(base, { path: '/d/a', name: 'A', description: 'D', price: 28 }).offers).toEqual({
      '@type': 'Offer', price: '28.00', priceCurrency: 'EUR', url: 'https://example.com/d/a',
    });
  });

  it('builds an OfferCatalog of plans linked to the organization', () => {
    const node = offerCatalogNode(base, {
      path: '/precios', name: 'Tarifas',
      plans: [{ name: 'Bono 5', description: '5 sesiones', price: 120 }],
    });
    expect(node).toMatchObject({
      '@type': 'OfferCatalog',
      provider: { '@id': 'https://example.com/#organization' },
      itemListElement: [{ '@type': 'Offer', name: 'Bono 5', price: '120.00', priceCurrency: 'EUR' }],
    });
  });
});
```
(y añadir `offerCatalogNode` al import).

- [ ] **Step 2: Ejecutar** `pnpm vitest run src/lib` → FAIL (módulos/funciones inexistentes).

- [ ] **Step 3: Implementar**

`src/lib/whatsapp.ts`:
```ts
export function whatsappLink(phone: string, message?: string): string {
  const url = `https://wa.me/${phone.replace(/\D/g, '')}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}
```

`src/lib/schedule.ts`:
```ts
import type { DayCode } from '../config/site';

export type Band = 'morning' | 'midday' | 'evening';
export interface Slot {
  time: string;
  className: string;
  instructor: string;
  band: Band;
  spots: number;
}
export interface DaySchedule {
  day: DayCode;
  slots: Slot[];
}

export const DAY_ORDER: DayCode[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
export const BAND_ORDER: Band[] = ['morning', 'midday', 'evening'];
const JS_DAY: DayCode[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function groupSchedule(days: DaySchedule[]) {
  return [...days]
    .filter((d) => d.slots.length > 0)
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
    .map((d) => ({
      day: d.day,
      bands: BAND_ORDER.map((band) => ({
        band,
        slots: d.slots.filter((s) => s.band === band).sort((a, b) => a.time.localeCompare(b.time)),
      })).filter((b) => b.slots.length > 0),
    }));
}

export function spotsStatus(spots: number): { tone: 'full' | 'last' | 'open'; action: 'waitlist' | 'book' } {
  if (spots <= 0) return { tone: 'full', action: 'waitlist' };
  if (spots === 1) return { tone: 'last', action: 'book' };
  return { tone: 'open', action: 'book' };
}

export function todayTab(date: Date, available: DayCode[]): DayCode {
  const today = JS_DAY[date.getDay()]!;
  return available.includes(today) ? today : available[0]!;
}
```

`src/lib/disciplines.ts`:
```ts
export type DisciplineCategory = 'reformer' | 'mat' | 'prenatal' | 'restorative';
export const CATEGORY_ORDER: DisciplineCategory[] = ['reformer', 'mat', 'prenatal', 'restorative'];

export function disciplineFilters(categories: DisciplineCategory[]): DisciplineCategory[] {
  const present = new Set(categories);
  return CATEGORY_ORDER.filter((c) => present.has(c));
}
```

`schema.ts`: `serviceNode` acepta `price?: number` y añade `offers: price === undefined ? undefined : { '@type': 'Offer', price: price.toFixed(2), priceCurrency: 'EUR', url }`; nueva:
```ts
export function offerCatalogNode(
  site: SiteConfig,
  input: { path: string; name: string; plans: { name: string; description: string; price: number }[] },
): JsonLdNode {
  const url = absoluteUrl(site.url, input.path);
  return compact({
    '@type': 'OfferCatalog',
    '@id': `${url}#offers`,
    name: input.name,
    url,
    provider: { '@id': schemaIds(site).organization },
    itemListElement: input.plans.map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      description: plan.description,
      price: plan.price.toFixed(2),
      priceCurrency: 'EUR',
    })),
  });
}
```

- [ ] **Step 4: Ejecutar** `pnpm vitest run src/lib` → PASS. `pnpm test` completo en verde.
- [ ] **Step 5: Commit** `feat(mova): schedule, WhatsApp, discipline filter and offer schema helpers`

---

### Task 4: Colecciones y contenido MOVA

**Files:**
- Modify: `src/content.config.ts`, `src/lib/queries.ts`, `src/i18n/ui/es.ts` (reescrito), `scripts/check-i18n.ts` (colecciones nuevas en la comprobación de nombres/paridad)
- Replace: `src/content/services/es/*` (5 disciplinas), `src/content/faq/es/*` (8), `src/content/blog/es/*` (2), `src/content/legal/es/*` (datos MOVA)
- Create: `src/content/{plans,schedule,team,testimonials,spaces}/es/*.yaml`

**Interfaces:**
- Consumes: `DisciplineCategory` (Task 3), `Band`, `DayCode`.
- Produces: colecciones `plans`, `schedule`, `team`, `testimonials`, `spaces`; `services` con campos de la spec §4.1; `getPlans(group?)`, `getSchedule()` → `DaySchedule[]`, `getTeam()`, `getTestimonials()`, `getSpaces()`, `getTrialPlan()` (el plan con `translationKey: 'trial'`); claves de diccionario usadas por Tasks 5–10.

- [ ] **Step 1: Schemas** — en `content.config.ts`:

```ts
const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      translationKey: z.string().min(1),
      order: z.number().int().default(100),
      summary: z.string().min(1),
      subtitle: z.string().min(1),
      category: z.enum(['reformer', 'mat', 'prenatal', 'restorative']),
      badge: z.string().min(1),
      duration: z.number().int().positive(),
      intensity: z.string().min(1),
      capacity: z.string().min(1),
      price: z.number().positive(),
      priceNote: z.string().min(1),
      highlights: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      compare: z.object({
        strength: z.number().int().min(1).max(3),
        flexibility: z.number().int().min(1).max(3),
        calm: z.number().int().min(1).max(3),
        level: z.string().min(1),
      }),
      homeTeaser: z.object({ label: z.string(), title: z.string(), text: z.string(), meta: z.string(), image: image(), imageAlt: z.string() }).optional(),
      image: image(),
      imageAlt: z.string().min(1),
      faqs: z.array(faqItem).default([]),
      updated: z.coerce.date(),
      draft: z.boolean().default(false),
    }),
});

const plans = defineCollection({
  loader: glob({ base: './src/content/plans', pattern: '**/*.yaml' }),
  schema: z.object({
    translationKey: z.string().min(1),
    group: z.enum(['bonos', 'membresias']),
    order: z.number().int(),
    eyebrow: z.string(),
    icon: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number().positive(),
    priceNote: z.string(),
    features: z.array(z.string()).min(1),
    cta: z.string(),
    highlight: z.enum(['none', 'recommended', 'dark']).default('none'),
    badge: z.string().optional(),
  }),
});

const schedule = defineCollection({
  loader: glob({ base: './src/content/schedule', pattern: '**/*.yaml' }),
  schema: z.object({
    translationKey: z.string().min(1),
    day: z.enum(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']),
    slots: z.array(z.object({
      time: z.string().regex(/^\d{2}:\d{2}$/),
      className: z.string(),
      instructor: z.string(),
      band: z.enum(['morning', 'midday', 'evening']),
      spots: z.number().int().min(0),
    })),
  }),
});

const team = defineCollection({
  loader: glob({ base: './src/content/team', pattern: '**/*.yaml' }),
  schema: ({ image }) => z.object({
    translationKey: z.string().min(1), order: z.number().int(), name: z.string(), role: z.string(),
    icon: z.string(), quote: z.string(), image: image(), imageAlt: z.string(), founder: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: glob({ base: './src/content/testimonials', pattern: '**/*.yaml' }),
  schema: z.object({ translationKey: z.string().min(1), order: z.number().int(), quote: z.string(), name: z.string(), detail: z.string() }),
});

const spaces = defineCollection({
  loader: glob({ base: './src/content/spaces', pattern: '**/*.yaml' }),
  schema: ({ image }) => z.object({
    translationKey: z.string().min(1), order: z.number().int(), eyebrow: z.string(), name: z.string(),
    detail: z.string(), image: image(), imageAlt: z.string(), wide: z.boolean().default(false),
  }),
});
```

(`image()` en YAML: ruta relativa `../../../assets/mova/<nombre>.jpg`.) Exportar todas en `collections`. Añadir a `scripts/check-i18n.ts` las colecciones nuevas en la lista de comprobación de nombres de fichero.

- [ ] **Step 2: Contenido** — transcribir de `docs/design/stitch/*.outline.txt`:
  - **Disciplinas** (`disciplinas.outline.txt`): 5 ficheros según tabla de la spec §4.1, con `subtitle` (frase en cursiva), cuerpo Markdown = párrafo descriptivo + `## Beneficios` (highlights) + `## Qué necesitas`; `summary` 40–60 palabras nuevo y factual; `compare` según la tabla de Stitch (Reformer Core 3/2/2 «Todos los niveles», Mat Flow 2/3/2 «Principiante a medio», Jumpboard 3/1/1 «Medio a avanzado», Maternidad 1/2/3 «Prenatal y posparto», Yin 1/3/3 «Restaurativo integral»); `homeTeaser` para Reformer Core (usa `practice-reformer`, «Reformer», «Reformer Pilates», «55 min • Nivel todos»), Mat Flow (`practice-mat`, «Mat & Flow», «Mat & postura consciente», «50 min • Suave & medio») y Yin (`practice-restorative`, «Restaurativo», «Fascia & liberación somática», «60 min • Restaurativo»), con los textos de Inicio. 1–2 `faqs` por disciplina.
  - **Planes** (`precios-y-horarios.outline.txt`): `trial.yaml` (18 €, recommended, badge «Recomendado»), `bono-5.yaml` (120 €), `bono-10.yaml` (210 €, dark, «Opción más elegida»), `unlimited-sanctuary.yaml` (180 €, membresias, dark), `clase-privada.yaml` (65 €, membresias).
  - **Horario**: `lunes.yaml` con los 8 slots de Stitch; `martes`–`viernes` con los mismos horarios y clases rotadas (instructoras Lucía Gómez, Elena Mas, Sofía Serrano, David Nogués, Carmen Soler; plazas variadas incluyendo un 0 y un 1 por día); `sabado.yaml` solo mañana (09:00, 10:30, 12:00).
  - **Equipo**: Clara Mendoza (fundadora, `team-clara`; `founder: true` y retrato `founder` para la sección de filosofía se referencia desde el diccionario), Elena Sanchís, Marina Valdés (`el-estudio.outline.txt`).
  - **Testimonios**: Clara Serrano, Lucía Valdés (Inicio).
  - **Rincones**: 4 de El Estudio (reformer room `wide: true`, vestuarios, sala mat, tea lounge).
  - **FAQ**: 4 de Stitch con `category: 'Precios y reservas'` + 4 `Generales` (qué es el reformer, nivel necesario, qué ropa llevar, dónde está el estudio).
  - **Blog**: `reformer-para-principiantes.md`, `respiracion-lateral-en-pilates.md` (texto nuevo, 250–400 palabras cada uno, autor «MOVA»).
  - **Legales**: los tres ficheros de la base sin cambios de estructura; textos genéricos (los datos del titular salen de `SITE`).
- [ ] **Step 3: Diccionario** `es.ts` — reescribir con MOVA manteniendo todas las claves estructurales de la base (a11y, nav, cookies, legal, footer, notFound, contact.form, blog, days, meta) y añadiendo por página los textos de Stitch que no están en colecciones: `home.*` (hero, manifiesto con 3 cifras, arco, prácticas, experiencia con 3 ítems, testimonios, invitación), `about.*` (hero, arquitectura con 2 cifras, cita, filosofía 2 párrafos + cita, pilares ×4, equipo, rincones, CTA), `services.*` (hero, filtros por categoría `category.<cat>`, cabeceras de tabla, primera vez ×4 pasos, asesoramiento), `pricing.*` (hero, pestañas, compromiso, horario, franjas `band.<band>`, estados de plazas, FAQ, formulario: labels, franjas preferidas), `nav.pricing`, `nav.whatsapp`, `cta.trial`, `cta.whatsapp`, `whatsapp.book` (plantilla `Hola, quiero reservar {className} el {day} a las {time}`), `whatsapp.general`. Meta titles 30–60 y descriptions 120–160 (`pnpm check:i18n` sin avisos).
- [ ] **Step 4: `queries.ts`** — `getPlans(group?)` (orden), `getTrialPlan()` (lanza error si no existe: el precio de la CTA depende de él), `getSchedule()` → `DaySchedule[]`, `getTeam()`, `getTestimonials()`, `getSpaces()`.
- [ ] **Step 5: Verificar** — `pnpm astro sync && pnpm check` (schemas validan todo); `pnpm build`. Commit `feat(mova): content collections and Spanish copy from Stitch`.

---

### Task 5: Cabecera, pie, PageHeader y CtaBand MOVA

**Files:** Modify `src/components/layout/Header.astro`, `Footer.astro`, `src/components/blocks/PageHeader.astro`, `CtaBand.astro`, `src/components/ui/Card.astro`, `Section.astro`.

**Referencia:** cabecera y pie de `inicio.html` (`<header>` y `<footer>`); CTA = sección 7 de `inicio.html`.

- [ ] **Step 1: Header** — tres zonas en escritorio (≥1200 px): izquierda `mainNav`; centro logo «MOVA» (`--font-serif`, 2.6rem, `letter-spacing: 0.1em`, enlace a home, único `<a>` de marca); derecha `secondaryNav` (WhatsApp = `whatsappLink(SITE.contact.whatsapp, t('whatsapp.general'))`, externo con aviso a11y) + botón `ctaNav` (`.btn--primary`). Fija arriba con fondo `--color-bg` al 80 % + `backdrop-filter: blur(24px)` y sombra cálida; altura 5rem; `main` con `padding-top` equivalente. <1200 px: logo a la izquierda, CTA compacto y hamburguesa (misma lógica JS/a11y de la base). Sin selector de idioma (un idioma). Sin avatar.
- [ ] **Step 2: Footer** — fondo `--color-bg-subtle`; columnas: marca (logo Garamond grande, lema en cursiva, «Estudio boutique Japandi…»), Navegación (`mainNav`), Prácticas (una por disciplina, enlazadas a su detalle), Horarios & Ubicación (dirección y horario desde `SITE`, formateados con `days.*`); barra inferior con © y legales + «Configurar cookies» si hay GA. Sin newsletter.
- [ ] **Step 3: PageHeader** — `eyebrow` en `Pill` + `DisplayTitle level=1 size="hero"` + lead a la derecha en ≥900 px (patrón El Estudio §1); breadcrumbs discretos encima. Props: `{ lang, crumbs, eyebrow?, title, accent?, lead?, align? }`.
- [ ] **Step 4: CtaBand** — tarjeta `--color-bg-inverse` con `--radius-xl`, brillo radial decorativo, `DisplayTitle tone="inverse"` (eyebrow «Comienza tu camino», título «Tu primera sesión de prueba», acento «te espera en calma»), texto, `.btn--light` «Reservar clase por {price} €» (precio de `getTrialPlan()`) → `/precios-y-horarios#solicitud`, `.btn--ghost-light` «Consultar por WhatsApp», y 2 garantías con `check-circle`. Props opcionales para sobrescribir textos (El Estudio usa los suyos).
- [ ] **Step 5: Card/Section** — `Card`: radio `--radius-lg`, fondo `--color-bg-subtle`, sin borde, sombra en hover; `Section` usa `DisplayTitle` (props `eyebrow`, `accent`, `align`).
- [ ] **Step 6: Verificar** — build + capturas `/` y `/contacto` a 1280 y 375; cabecera y pie coinciden con `screens/inicio-0.jpg` y `inicio-3.jpg`; menú móvil operativo (revisar HTML del botón y `aria-*`). Commit `feat(mova): header, footer, page header and CTA band`.

---

### Task 6: Inicio

**Files:** Modify `src/views/HomeView.astro`; Create `src/components/blocks/StatStrip.astro`.
**Referencia:** `inicio.html` / `inicio.outline.txt` / `screens/inicio-*.jpg` — secciones 1–7 (spec §5.1).

- [ ] **Step 1:** Hero — `<section>` a `min-height: calc(100svh - 5rem)` con `<Picture src={hero-studio}>` en `position:absolute; object-fit:cover` (eager, `fetchpriority="high"`, `sizes="100vw"`, widths 640–2400), degradado inferior `linear-gradient(to top, rgb(51 37 29 / .55), transparent 60%)`; contenido abajo en 2 columnas (≥900 px): `Pill tone="glass"` + `DisplayTitle level=1 size="hero" tone="inverse"`; derecha lead + `.btn--light` + botón circular `arrow-down` → `#manifiesto`. Tarjeta flotante «Estudio en vivo» (`hero-live-preview`, oculta <900 px, `aria-hidden` no: es imagen con alt).
- [ ] **Step 2:** Manifiesto (`id="manifiesto"`) — cabecera con `DisplayTitle` y «01 / Propósito» a la derecha; rejilla 5/7: tarjeta con SVG de arcos (decorativo) + 2 párrafos + `StatStrip` (3 cifras: valor en Garamond, etiqueta eyebrow); imagen `manifesto-group` con cita flotante (`<blockquote>` Garamond cursiva sobre fondo blanco 90 %).
- [ ] **Step 3:** Arco «M O V A» — fondo `--color-bg-subtle`; letras M, O(oculta), V, A en `aria-hidden` (Plus Jakarta 300, `clamp(6rem, 22vw, 18rem)`, color `--color-surface-strong`); arco central (`border-radius: 999px 999px 999px 999px / 50%`… elipse vertical 18rem×28rem) con `arch-studio` y `<blockquote>` centrado en tarjeta blanca. En móvil: solo el arco.
- [ ] **Step 4:** Prácticas — cabecera `DisplayTitle` + lead + `.btn--primary` «Ver horarios de clase» → `/precios-y-horarios#horario`; 3 tarjetas desde `homeTeaser` de las disciplinas (imagen con `Pill` superpuesto, h3, texto, pie «meta» + flecha; toda la tarjeta enlaza al detalle).
- [ ] **Step 5:** Experiencia sensorial — banda `--color-bg-subtle` con tarjeta blanca `--radius-xl`: eyebrow, h2, texto, lista de 3 (`spa`, `group`, `coffee` + h3 + texto), 2 imágenes escalonadas (`ritual-tea`, `ritual-dressing-room`).
- [ ] **Step 6:** Testimonios — eyebrow + h2 centrados; 2 tarjetas `--color-bg-subtle` con cita Garamond cursiva y avatar de iniciales (círculo `--color-highlight`).
- [ ] **Step 7:** `CtaBand`. JSON-LD igual que la base (WebPage + FAQPage si aplica: quitar FAQ de Inicio, Stitch no la tiene). Un solo h1.
- [ ] **Step 8:** Verificar — `pnpm check && pnpm build && pnpm verify`; capturas 1280/375 vs `screens/inicio-*.jpg`. Commit `feat(mova): home page`.

---

### Task 7: El Estudio

**Files:** Modify `src/views/AboutView.astro`. **Referencia:** `el-estudio.*` (spec §5.2).

- [ ] **Step 1:** `PageHeader` (eyebrow «El Estudio • Filosofía Japandi», título/acento, lead a la derecha) — sin CTA.
- [ ] **Step 2:** Rejilla 7/5: imagen `studio-main-room` (`--radius-xl`) con `Pill tone="glass"` «Luz natural…» y etiqueta «Sala principal»; derecha tarjeta «01» (número Garamond grande `--color-border`, eyebrow, h2 «Arquitectura del silencio», texto, 2 cifras con separador) + tarjeta-imagen `studio-tea-detail` con cita Garamond sobre degradado e icono `spa`.
- [ ] **Step 3:** Filosofía — banda `--color-bg-subtle`: imagen circular de la fundadora (`founder` de `team`, marco `--color-highlight`) con `Pill` nombre/rol y cita; derecha `DisplayTitle` + 2 párrafos + cita con borde izquierdo.
- [ ] **Step 4:** Cuatro pilares — `DisplayTitle` centrado; 4 tarjetas (icono en círculo, eyebrow «01 • Personalización», h3, texto, pie con etiqueta + `arrow-up-right`) en 1/2/4 columnas.
- [ ] **Step 5:** Instructoras — cabecera 2 columnas; 3 retratos (`--radius-lg`, 4:5) con píldora blanca superpuesta (nombre, rol eyebrow, icono) y cita Garamond cursiva debajo.
- [ ] **Step 6:** Rincones — `DisplayTitle` centrado; rejilla 2 filas: fila 1 = `wide` (2/3) + otro (1/3), fila 2 = 1/3 + 2/3; tarjetas-imagen con degradado inferior y texto superpuesto (eyebrow, h3, detalle).
- [ ] **Step 7:** `CtaBand` con textos de El Estudio («Siente la atmósfera en persona», «Reservar clase inicial», «Solicitar recorrido guiado» → contacto). JSON-LD `AboutPage` + `BreadcrumbList`; `team` como `Person` con `worksFor → #organization` (añadir `personNode` a `schema.ts` con test si se usa).
- [ ] **Step 8:** Verificar (capturas vs `screens/el-estudio-*.jpg`). Commit `feat(mova): studio page`.

---

### Task 8: Disciplinas y detalle de disciplina

**Files:** Modify `src/views/ServicesView.astro`, `ServiceDetailView.astro`; Create `src/components/blocks/DisciplineCard.astro`, `src/lib/filter-client.ts`. **Referencia:** `disciplinas.*` (spec §5.3).

- [ ] **Step 1:** `PageHeader` con eyebrow «Catálogo de disciplinas», título/acento, lead y nota con `leaf` «Atención personalizada · Máx. 6 plazas».
- [ ] **Step 2:** Filtro — `<div class="js-only" role="group" aria-label="Filtrar prácticas">` con `<button aria-pressed>` «Todas» + `disciplineFilters(...)` (etiquetas `services.category.*`); región `<p aria-live="polite" class="visually-hidden">` con el recuento. `filter-client.ts`: al pulsar, marca `aria-pressed`, oculta (`hidden`) los `[data-category]` que no coinciden y actualiza el recuento; sin JS los botones no se ven y las tarjetas sí.
- [ ] **Step 3:** `DisciplineCard` (props `entry`, `variant: 'featured' | 'compact'`, `headingLevel`): imagen con `Pill` (badge) y píldora de duración/plazas; badge `highlight` de intensidad + meta; h2/h3 = enlace al detalle; subtítulo Garamond cursiva; texto; `featured` → highlights en rejilla 2×2 con `check-circle`, `compact` → etiquetas en píldoras; precio Garamond «28€» + nota; `.btn--primary` «Reservar sesión» → `/precios-y-horarios#solicitud`. `data-category` en el contenedor.
- [ ] **Step 4:** Destacada (1) a ancho completo y resto en rejilla 2 columnas (≥900 px).
- [ ] **Step 5:** Tabla comparativa — `<table>` con `<caption class="visually-hidden">`, `th scope`; celdas de puntos: 3 círculos (`aria-hidden`) + texto accesible `{n} de 3` (`visually-hidden`); scroll horizontal propio en móvil (`overflow-x:auto` en un contenedor con `tabindex="0"` y `role="region"` + `aria-label`).
- [ ] **Step 6:** «¿Primera vez en MOVA?» — 2 columnas: izquierda `DisplayTitle` + texto + aviso con `schedule`; derecha 4 pasos (número Garamond, h3, texto, etiqueta con icono).
- [ ] **Step 7:** Asesoramiento — tarjeta `--color-bg-subtle` con `DisplayTitle`, texto y `.btn--primary` «Consultar por WhatsApp» (externo). Sin test (fuera de alcance).
- [ ] **Step 8:** Detalle (`ServiceDetailView`) — `PageHeader` (eyebrow badge, título, acento = subtitle), bloque 2 columnas imagen + ficha (duración, intensidad, plazas, precio, CTA), `summary` como definición, contenido Markdown en `.prose`, highlights, FAQ propias, otras disciplinas (3 `DisciplineCard compact`), `CtaBand`. JSON-LD `Service` con `price`.
- [ ] **Step 9:** Verificar (capturas `/disciplinas` 1280/375 con y sin JS; `/disciplinas/reformer-core-align`). Commit `feat(mova): disciplines catalogue and detail pages`.

---

### Task 9: Precios y Horarios (página nueva)

**Files:** Create `src/views/PricingView.astro`, `src/components/blocks/PlanCard.astro`, `ScheduleBoard.astro`, `RequestForm.astro`, `src/lib/tabs-client.ts`; Modify `src/pages/[...path].astro` (rama `pricing` → `PricingView`, retirar la temporal de Task 1). **Referencia:** `precios-y-horarios.*` (spec §5.4).

- [ ] **Step 1: `tabs-client.ts`** — inicializa todo `[data-tabs]`: el `tablist` (`role="tablist"`, generado oculto con `.js-only`) contiene `button[role=tab][aria-controls][aria-selected]`; los paneles `[role=tabpanel][aria-labelledby]`. Al iniciar: oculta paneles no seleccionados (`hidden`), oculta los h3 de panel (`.tabs__panel-title` → `visually-hidden`); clic y teclas ←/→/Inicio/Fin con roving `tabindex`. Si el contenedor tiene `data-tabs-initial="today"`, selecciona `todayTab(new Date(), días disponibles)`.
- [ ] **Step 2: Cabecera** centrada: `Pill` eyebrow, `DisplayTitle level=1 align="center"`, lead.
- [ ] **Step 3: Planes** — `[data-tabs]` con pestañas «Clases sueltas & bonos» / «Membresías mensuales» y un panel por grupo (h3 visible sin JS). `PlanCard` (props plan): variantes `none` (`--color-bg-muted`), `recommended` (badge `--color-eyebrow`), `dark` (`--color-bg-inverse`, texto claro, CTA `.btn--light`); eyebrow + icono, h4 nombre, descripción, precio Garamond grande + nota, lista con `check`, CTA → `#solicitud` (con `data-plan` para preseleccionar el interés en el formulario vía JS).
- [ ] **Step 4: Compromiso** — banda `--color-bg-muted` `--radius-xl`: eyebrow, cita Garamond (h2 visual? no: `<blockquote>` + eyebrow; el h2 de sección es `visually-hidden` «Compromiso MOVA»), texto, 2 imágenes (`pricing-savasana` circular, `pricing-reformer`).
- [ ] **Step 5: `ScheduleBoard`** (`id="horario"`) — banda `--color-bg-subtle`; cabecera (eyebrow «Disponibilidad en vivo», h2, nota) + tablist de días (píldoras); por día un panel con h3 (día) y por franja un h4 con icono (`sunrise`/`sun`/`moon`) y rejilla de tarjetas (hora Garamond grande, `Pill` clase, instructora, estado con punto de color según `spotsStatus` + texto, enlace «Reservar»/«Anotarme» → `whatsappLink(SITE.contact.whatsapp, t('whatsapp.book', {className, day, time}))` con nombre accesible completo). `data-tabs-initial="today"`.
- [ ] **Step 6: FAQ + formulario** — 2 columnas: FAQ (categoría «Precios y reservas», `FaqList` con estilo tarjeta redondeada) y `RequestForm` (`id="solicitud"`): tarjeta `--color-bg-muted` con «M» Garamond, h2, texto; campos nombre, teléfono (WhatsApp), email, interés (`<select>` con los planes: «{name} ({price}€)»), franja preferida (4 opciones del diccionario), privacidad + honeypot; mismo JS de envío que `ContactForm` (extraer a `src/lib/form-client.ts` y reutilizarlo en ambos); nota con `shield-check`. Sin `PUBLIC_CONTACT_ENDPOINT`: la tarjeta muestra WhatsApp, teléfono y email (`ContactInfo` compacto) en lugar del formulario.
- [ ] **Step 7: SEO** — título/descr. del diccionario; JSON-LD `WebPage` + `BreadcrumbList` + `FAQPage` + `offerCatalogNode` (planes).
- [ ] **Step 8: Verificar** — capturas `/precios-y-horarios` 1280/375, con y sin JS (sin JS: ambos grupos de planes y todos los días visibles, con sus h3); build con y sin `PUBLIC_CONTACT_ENDPOINT`. Commit `feat(mova): pricing and weekly schedule page`.

---

### Task 10: Resto de páginas, SEO/GEO y documentación

**Files:** Modify `src/views/ContactView.astro`, `FaqView.astro`, `BlogView.astro`, `PostView.astro`, `LegalView.astro`, `src/pages/404.astro`, `src/components/blocks/ContactInfo.astro`, `FaqList.astro`, `PostList.astro`, `src/pages/llms.txt.ts`, `scripts/generate-placeholders.ts` (OG/logo MOVA), `public/favicon.svg`, `README.md`, `docs/launch-checklist.md`.

- [ ] **Step 1:** Contacto — `PageHeader`, tarjeta datos (`ContactInfo` con iconos en círculos `--color-bg-muted`, horario, mapa) + formulario base con estilo `RequestForm` (mismos campos base).
- [ ] **Step 2:** FAQ, blog, artículo, legales y 404 — `PageHeader` nuevo; `FaqList` como tarjetas redondeadas (`--radius-lg`, `--color-bg-subtle`, `chevron-down` que rota); `PostList` en tarjetas; `.prose` con Garamond en citas y `h2` con estilo sección; 404 con `DisplayTitle` y enlaces principales.
- [ ] **Step 3:** `llms.txt` — añade sección «Pricing» (planes con precio) y «Schedule» (horario de apertura) (`buildLlms` acepta secciones extra: añadir `extra?: { title: string; lines: string[] }[]` con test en `llms.test.ts`).
- [ ] **Step 4:** Marca — `favicon.svg` (monograma «M» Garamond `#33251d` sobre `#fcf9f4`), `generate-placeholders.ts` genera `logo.png`/`apple-touch-icon.png`/`favicon.ico` con ese monograma y `og-default.jpg` 1200×630 a partir de `hero-studio.jpg` con banda inferior y «MOVA» (texto SVG; si sharp no renderiza la fuente, usar formas vectoriales del monograma).
- [ ] **Step 5:** Docs — README (sección «Proyecto: MOVA Pilates» con origen Stitch y cómo actualizar precios/horario/equipo), checklist (+ sustituir imágenes IA, confirmar datos del negocio, revisar precios y horario).
- [ ] **Step 6: Verificación final** — `pnpm format`, `pnpm check`, `pnpm build`, `pnpm verify`; Lighthouse móvil en `/`, `/disciplinas`, `/precios-y-horarios` (≥ 90 ×4); capturas de las 4 páginas Stitch a 1280 lado a lado con `screens/*.jpg` y a 375 (sin scroll horizontal); build sin endpoint (Review Focus 5); Docker `compose up` → 200. Commit `feat(mova): remaining pages, brand assets and docs`.
