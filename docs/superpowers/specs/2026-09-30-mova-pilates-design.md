# Spec — MOVA Pilates (web sobre Genesis Web Base)

- **Fecha:** 2026-09-30
- **Rama:** `feat/pilates-mova` (desde `main`)
- **Estado:** pendiente de revisión
- **Base:** `docs/superpowers/specs/2026-09-30-web-base-design.md` — todas sus reglas siguen vigentes salvo lo que esta spec cambia explícitamente.
- **Diseño de referencia:** Google Stitch, proyecto «Pilates Studio Multipage Website» (`7291495815670104023`), pantallas Inicio, El Estudio, Disciplinas, Precios y Horarios.

---

## 1. Objetivo

Web del estudio boutique de pilates **MOVA** (Salamanca, Madrid) que replica el diseño de Stitch sobre la web base, sin romper ninguna de sus garantías: SEO, JSON-LD, GEO, accesibilidad, rendimiento, consentimiento, Docker y tests.

### Criterios de éxito

1. Las 4 páginas de Stitch reproducen su estructura, jerarquía visual, paleta, tipografía y composición a 1280 px, y se adaptan sin scroll horizontal de 320 a 1440 px.
2. El resto de páginas de la base (detalle de disciplina, contacto, FAQ, blog, artículo, legales y 404) usan la misma estética.
3. `pnpm check` y `pnpm verify` en verde; Lighthouse móvil ≥ 90 en las cuatro categorías en Inicio, Disciplinas y Precios y Horarios.
4. Todo el contenido visible sale de colecciones o del diccionario (fuente única). Ningún precio, horario ni nombre se repite a mano en dos sitios.
5. Sin JavaScript todo el contenido es visible (filtros y pestañas muestran todo).

### Fuera de alcance

- Test de 1 minuto, perfil de usuario y newsletter.
- Reservas o pagos online: «Reservar» lleva a WhatsApp o al formulario de solicitud.
- Inglés (solo español).
- Tailwind, Google Fonts o Material Symbols en tiempo de ejecución.

---

## 2. Marca y sistema de diseño

### 2.1 Tokens (`src/styles/tokens.css`, solo se cambian valores)

| Token semántico | Valor | Origen Stitch |
| --- | --- | --- |
| `--color-bg` | `#fcf9f4` | background |
| `--color-bg-subtle` | `#f6f3ee` | surface-container-low |
| `--color-bg-muted` | `#f0ede9` | surface-container |
| `--color-surface` | `#ffffff` | surface-container-lowest |
| `--color-surface-strong` (nuevo) | `#ebe8e3` | surface-container-high |
| `--color-text` | `#1c1c19` | on-surface |
| `--color-text-muted` | `#4e4540` | on-surface-variant |
| `--color-bg-inverse` | `#33251d` | primary |
| `--color-accent` | `#4a3b32` | primary-container (botones) |
| `--color-accent-hover` | `#33251d` | primary |
| `--color-link` / `--color-eyebrow` (nuevo) | `#755844` | secondary |
| `--color-highlight` (nuevo) | `#ffd8bf` | secondary-container (badges) |
| `--color-border` | `#d2c4bd` | outline-variant |
| `--color-border-strong` | `#80756f` | outline |
| `--color-error` | `#ba1a1a` | error |

- Todos los pares de texto ≥ 4,5:1 (verificar `#755844` sobre `#fcf9f4` y `#f0ede9`, y blanco sobre `#4a3b32`).
- Radios: `--radius-md: 1rem`, `--radius-lg: 2rem`, `--radius-xl` (nuevo) `3rem`, `--radius-full`.
- Sombra cálida: `--shadow-md: 0 16px 40px -12px rgb(74 59 50 / 0.08), 0 2px 6px rgb(74 59 50 / 0.03)`.

### 2.2 Tipografía

- **Plus Jakarta Sans** 300/400/500/600 → `--font-sans` (cuerpo, titulares en mayúsculas finas).
- **EB Garamond** 400 normal + cursiva → `--font-serif` (nuevo): segunda línea de titulares, citas, precios y logotipo.
- Autoalojadas con la Fonts API; preload solo de Plus Jakarta Sans 300/400.
- Escala: se ajusta `--step-*` para reproducir display 4rem / 2.25rem móvil, headline 2.25rem, body 0.9375–1.125rem.
- Eyebrow: 0.75rem, 600, `letter-spacing: 0.12em`, mayúsculas, color `--color-eyebrow`.

### 2.3 Componente `DisplayTitle`

Patrón de Stitch: línea 1 en Plus Jakarta Sans light, mayúsculas, tracking amplio; línea 2 en EB Garamond cursiva, color acento.

```astro
<DisplayTitle level={1} eyebrow="El Estudio • Filosofía Japandi" title="Nuestro santuario" accent="diseñado para respirar" />
```

Renderiza un único `<hN>` con las dos líneas en `<span>` (la segunda con `display:block`), de modo que el encabezado se lee completo. `eyebrow` es un `<p>` previo.

### 2.4 Iconos

`Icon.astro` añade, como SVG inline trazados a mano (sin fuente externa): `spa`, `group`, `coffee`, `sun`, `air`, `leaf`, `check`, `check-circle`, `star`, `infinity`, `user`, `schedule`, `tune`, `hanger`, `moon`, `sunrise`, `shield-check`, `arrow-down`, `arrow-up-right`, `chevron-down`, `whatsapp`.

---

## 3. Configuración

### 3.1 `SITE`

- `name: 'MOVA'`, `legalName: 'MOVA Pilates & Wellness Studio S.L.'` (dato de ejemplo), `taxId` de ejemplo.
- `entity: { schemaType: 'ExerciseGym', local: true, priceRange: '€€', areaServed: ['Madrid'] }`.
- Dirección: Calle Serrano 45, 28001 Madrid (región Madrid, ES); geo aproximado del barrio de Salamanca.
- Horario: lunes a viernes 07:30–21:00; sábados 09:00–14:00.
- Teléfono y WhatsApp de ejemplo, email `hola@` de ejemplo, Instagram de ejemplo.
- `themeColor: '#fcf9f4'`.

### 3.2 Idioma y rutas

- `locales` solo `es`. Se eliminan `src/i18n/ui/en.ts` y las carpetas `en/` de contenido. `hreflang`, `og:locale:alternate` y selector desaparecen solos (comportamiento ya probado).
- `routes.ts`: `home ''`, `about 'el-estudio'`, `services 'disciplinas'`, `pricing 'precios-y-horarios'` (nuevo), `contact 'contacto'`, `faq 'preguntas-frecuentes'`, `blog 'blog'`, `legal 'legal'`.
- `STATIC_PAGES` añade `pricing`.

### 3.3 Navegación (`src/config/nav.ts`)

- `mainNav`: Inicio, El Estudio, Disciplinas, Precios & Horarios.
- `secondaryNav` (nuevo): WhatsApp (externo, `wa.me`), Contacto.
- `ctaNav`: «Reservar clase de prueba» → `/precios-y-horarios#solicitud`.
- Pie: Navegación, Prácticas (enlaces a cada disciplina), Horarios & Ubicación, legales. Sin newsletter.

---

## 4. Contenido

Todas las colecciones siguen la convención de la base (`<lang>/<slug>`, `translationKey`, validación zod).

### 4.1 `services` → disciplinas (5)

Campos nuevos (además de los de la base): `category` (`reformer` | `mat` | `prenatal` | `restorative`), `duration` (min), `intensity`, `capacity`, `price` (número, €), `priceNote`, `badge`, `highlights: string[]`, `featured: boolean`, `compare: { strength: 1–3, flexibility: 1–3, calm: 1–3, level: string }`, `homeTeaser?: { label, text }` (las 3 que aparecen en Inicio).

| Slug | Título | Categoría | Min | Precio | Destacada |
| --- | --- | --- | --- | --- | --- |
| `reformer-core-align` | Reformer Core & Align | reformer | 55 | 28 € | sí |
| `mat-flow-sculpt` | Mat Flow & Sculpt | mat | 50 | 20 € | |
| `reformer-jumpboard` | Reformer Jumpboard & Cardio | reformer | 50 | 28 € | |
| `pilates-maternidad` | Pilates Maternidad Consciente | prenatal | 55 | 30 € | |
| `yin-miofascial` | Yin & Miofascial Release | restorative | 60 | 22 € | |

Textos, highlights y datos de la tabla: los de Stitch (pantalla Disciplinas). `summary`: la frase de 40–60 palabras (GEO).

### 4.2 Colecciones nuevas

| Colección | Fichero | Campos |
| --- | --- | --- |
| `plans` | `plans/es/*.yaml` | `group` (`bonos` \| `membresias`), `order`, `eyebrow`, `icon`, `name`, `description`, `price`, `priceNote`, `features[]`, `cta`, `highlight` (`none` \| `recommended` \| `dark`), `badge?` |
| `schedule` | `schedule/es/<dia>.yaml` | `day` (`Mo`…`Sa`), `order`, `slots: { time, className, instructor, band: 'morning' \| 'midday' \| 'evening', spots: number }[]` |
| `team` | `team/es/*.yaml` | `name`, `role`, `icon`, `quote`, `image`, `imageAlt`, `order`, `founder?` |
| `testimonials` | `testimonials/es/*.yaml` | `quote`, `name`, `detail`, `order` |
| `spaces` | `spaces/es/*.yaml` | `eyebrow`, `name`, `detail`, `image`, `imageAlt`, `order`, `wide?` |

- Planes (Stitch): Clase de Prueba Primerizos 18 €, Bono 5 120 €, Bono 10 210 € (grupo `bonos`); Unlimited Sanctuary 180 €/mes, Clase Privada 65 € (grupo `membresias`).
- Horario: el de Stitch para el lunes; el resto de días se generan con los mismos datos rotando instructoras (datos de ejemplo) y el sábado solo con franja de mañana.
- `spots: 0` = completo (lista de espera), `1` = última plaza.
- La clase de prueba aparece con dos precios en Stitch (18 € y 20 €): se unifica en **18 €** tomando `plans` como fuente única; todo CTA que muestre precio lo lee de ahí.

### 4.3 FAQ, blog y legales

- FAQ: las 4 de Stitch (cancelación, experiencia previa, congelar bono, toallas y duchas) con `category: 'Precios y reservas'` y 4 generales del estudio. Precios y Horarios muestra las de su categoría.
- Blog: 2 artículos de ejemplo sobre pilates (reformer para principiantes, respiración).
- Legales: plantillas de la base con datos de MOVA.

### 4.4 Imágenes

- Se descargan las 26 imágenes de Stitch (sin logo ni avatar) a `src/assets/mova/<nombre>.jpg` con `scripts/fetch-stitch-images.ts` (se ejecuta una vez y se versionan las imágenes).
- Todas pasan por `astro:assets` (AVIF/WebP, `srcset`), con `alt` descriptivo en español.
- Son imágenes generadas por IA: son de maqueta y deben sustituirse por fotos reales antes del lanzamiento (anotado en el checklist).
- `og-default.jpg` y `logo.png` se regeneran con la marca MOVA.

---

## 5. Páginas

### 5.1 Inicio (`HomeView`)

1. **Hero** a pantalla completa (`min-height: 100svh` menos cabecera): foto de fondo (`<Picture>`, LCP, eager/high), degradado para legibilidad, eyebrow en píldora, `DisplayTitle` h1 «Espacio para el movimiento / y el equilibrio», texto y CTA a la derecha, botón circular «bajar» (ancla a `#manifiesto`), tarjeta flotante «Estudio en vivo» con miniatura (oculta en móvil).
2. **Manifiesto**: eyebrow, `DisplayTitle` h2, «01 / Propósito»; tarjeta con diagrama de arcos (SVG decorativo) y texto; 3 cifras (6 máx. alumnas, 100 % luz natural, 75 m²); imagen de grupo con cita flotante.
3. **Arco M O V A**: letras gigantes decorativas (`aria-hidden`) y un arco con imagen y cita centrada (la cita es texto real, `<blockquote>`).
4. **Prácticas**: `DisplayTitle` + CTA «Ver horarios de clase»; 3 tarjetas (las disciplinas con `homeTeaser`) con imagen, etiqueta, h3, texto y «duración • nivel».
5. **Experiencia sensorial**: tarjeta blanca con h2, texto, lista de 3 elementos con icono y dos imágenes.
6. **Testimonios**: h2 centrado y 2 tarjetas (`testimonials`) con iniciales.
7. **Invitación**: tarjeta oscura con `DisplayTitle`, texto, CTA «Reservar clase por 18 €» (precio de `plans`) + «Consultar por WhatsApp», y 2 garantías con check.

### 5.2 El Estudio (`AboutView`)

1. `DisplayTitle` h1 «Nuestro santuario / diseñado para respirar» + texto a la derecha.
2. Imagen principal con píldora «Luz natural…» y etiqueta «Sala principal»; tarjeta «01 · Arquitectura del silencio» con 2 cifras (320 m², 432 Hz); tarjeta con imagen y cita «Menos ruido, más presencia».
3. Filosofía: imagen circular de la fundadora con píldora (nombre y rol, desde `team` con `founder`), texto de 2 párrafos y cita.
4. **Los cuatro pilares**: 4 tarjetas numeradas con icono (diccionario).
5. **Instructoras** (`team`): 3 retratos con píldora nombre/rol y cita debajo.
6. **Rincones** (`spaces`): rejilla asimétrica de 4 tarjetas-imagen con texto superpuesto.
7. CTA oscuro: «Reservar clase inicial» + «Solicitar recorrido guiado» (a contacto).

Nota: la errata de Stitch «Instructorass» se corrige.

### 5.3 Disciplinas (`ServicesView`)

1. `DisplayTitle` h1 «Prácticas conscientes / a tu propio ritmo», texto y nota «Atención personalizada · máx. 6 plazas».
2. **Filtro**: chips «Todas las prácticas» + una por categoría.
3. **Tarjeta destacada** (`featured`): imagen, badges, meta (plazas • min • intensidad), h2, subtítulo en cursiva, texto, 4 highlights con check, precio y «Reservar sesión».
4. **Rejilla** de 2 columnas con el resto, mismo contenido en formato compacto. Cada tarjeta enlaza también a su página de detalle (el h2/h3 es el enlace).
5. **Tabla comparativa** (`<table>` accesible con `<caption>`, `scope`; puntos 1–3 como texto accesible «2 de 3»).
6. **«¿Primera vez en MOVA?»**: aviso «llega 15 min antes» y 4 pasos numerados (diccionario).
7. **Asesoramiento**: tarjeta con texto y «Consultar por WhatsApp».

### 5.4 Precios y Horarios (`PricingView`, nueva)

1. `DisplayTitle` h1 centrado «Invierte en ti / sin compromisos ocultos» + texto.
2. **Toggle** «Clases sueltas & bonos» / «Membresías mensuales» (pestañas); 3 tarjetas por grupo con variantes `recommended` (badge) y `dark`.
3. **Compromiso MOVA**: banda con cita en Garamond y dos imágenes.
4. **Horario semanal**: pestañas Lun–Sáb; por día, franjas Mañanas / Mediodía / Tardes con tarjetas (hora, clase, instructora, estado de plazas con punto de color + texto, enlace «Reservar» o «Anotarme» a WhatsApp con mensaje prellenado).
5. **FAQ** (categoría «Precios y reservas», `<details>`) a la izquierda y **formulario de solicitud** (`id="solicitud"`) a la derecha: nombre, teléfono (WhatsApp), email, interés (opciones = `plans`), franja preferida, privacidad; envío al endpoint configurado. Sin endpoint: tarjeta con WhatsApp, teléfono y email.

### 5.5 Resto de páginas

- **Detalle de disciplina** (`ServiceDetailView`): cabecera con `DisplayTitle`, imagen, meta y precio, `summary`, contenido, highlights, FAQ propias, otras disciplinas, CTA.
- **Contacto**: `DisplayTitle`, tarjeta de datos (dirección, horario, WhatsApp, teléfono, email, mapa) y formulario base con el estilo MOVA.
- **FAQ, blog, artículo, legales, 404**: `PageHeader` rediseñado (eyebrow en píldora + `DisplayTitle`), tarjetas y tipografía MOVA.
- **CtaBand**: tarjeta oscura redondeada de Stitch (Inicio §7), reutilizada en todas las páginas.

---

## 6. Interacción (mejora progresiva)

| Elemento | Sin JS | Con JS | Accesibilidad |
| --- | --- | --- | --- |
| Filtro de disciplinas | Todas visibles, chips ocultos (`.js-only`) | Muestra solo las de la categoría | `<button aria-pressed>`, región con `aria-live="polite"` que anuncia «N prácticas» |
| Toggle de planes | Ambos grupos visibles, cada uno con su h3 | Pestañas | `role="tablist"`, `tab`/`tabpanel`, `aria-selected`, flechas ←/→, Inicio/Fin |
| Horario por día | Todos los días en secuencia, cada uno con h3 | Pestañas, día actual preseleccionado (domingo → lunes) | Igual que el toggle |
| Reservar (horario) | Enlace a WhatsApp con mensaje prellenado | Igual | «Reservar Reformer Flow, lunes 07:30» como nombre accesible |
| Botón «bajar» del hero | Ancla | Scroll suave (respeta `prefers-reduced-motion`) | `aria-label` |

Un único módulo `src/lib/tabs-client.ts` gestiona las pestañas.

---

## 7. SEO, JSON-LD y GEO

- Entidad `ExerciseGym` con dirección, geo, horario, `priceRange` y `sameAs`.
- Disciplinas: `Service` con `offers: { '@type': 'Offer', price, priceCurrency: 'EUR' }`.
- Precios y Horarios: `WebPage` + `FAQPage` + `OfferCatalog` con los planes.
- `llms.txt`: añade planes con precio y horario de apertura.
- Títulos y descripciones nuevos en el diccionario (30–60 / 120–160 caracteres).

---

## 8. Funciones puras nuevas (con tests)

- `whatsappLink(phone, message)` → `https://wa.me/<digits>?text=<encoded>`.
- `groupSchedule(days)` → días ordenados con slots agrupados por franja y ordenados por hora; franjas vacías omitidas.
- `spotsStatus(spots)` → `{ tone: 'full' | 'last' | 'open', label }`.
- `todayTab(date, availableDays)` → día a preseleccionar (domingo o día sin clases → primer día disponible).
- `offerCatalogNode(site, plans)` y `offers` en `serviceNode`.
- `disciplineFilters(services)` → categorías presentes con su etiqueta, en orden fijo.

---

## 9. Riesgos y decisiones

- Imágenes generadas por IA: aptas solo como maqueta.
- Datos del negocio (teléfono, NIF, razón social) de ejemplo: marcados en el checklist.
- El horario es contenido estático: cambios de plazas requieren editar YAML y redesplegar (no hay sistema de reservas).
- Los cambios genéricos que surjan en la base (p. ej. `DisplayTitle`, `tabs-client`) quedan en esta rama; portarlos a `main` es una decisión posterior.
