# Checklist de lanzamiento

## Configuración

- [ ] `SITE.url` = dominio definitivo (canonical, sitemap, schema y `llms.txt` lo heredan)
- [ ] Datos de `site.ts` completos y reales (nombre, razón social, NIF, contacto, dirección, horarios)
- [ ] `.env` de producción definido (GA, endpoint del formulario, `CONTACT_ORIGIN`)
- [ ] Redirecciones 301 de URLs antiguas en `src/config/redirects.ts`
- [ ] Contenido de ejemplo sustituido; ninguna página dice «de ejemplo»

## SEO

- [ ] `pnpm check` sin errores y con los avisos de longitud revisados
- [ ] Title (30–60) y description (120–160) únicos por página e idioma
- [ ] `pnpm verify`: un `<h1>` por página, canonical absoluto, JSON-LD válido, imágenes completas
- [ ] hreflang recíproco entre idiomas; slugs traducidos
- [ ] Sitemap enviado a Google Search Console y Bing Webmaster Tools
- [ ] `og-default.jpg` 1200×630 revisado en los validadores de LinkedIn, X y WhatsApp
- [ ] JSON-LD validado en Rich Results Test y validator.schema.org (home, servicio, post, FAQ)

## GEO

- [ ] `robots.txt` con la política de bots de IA decidida (`SITE.aiTraining`)
- [ ] `llms.txt` revisado: descripción factual, servicios con resumen, contacto
- [ ] Nombre, dirección, teléfono y URL idénticos en web, schema, `llms.txt`, Google Business Profile y directorios
- [ ] Cada servicio abre con un `summary` citable y tiene FAQ
- [ ] Contenido clave visible con JavaScript desactivado

## Responsive y rendimiento

- [ ] Probado a 320 / 375 / 768 / 1024 / 1440 px sin scroll horizontal
- [ ] Imagen LCP real optimizada (hero) y con `fetchpriority="high"`
- [ ] Lighthouse móvil ≥ 90 en Performance, Accessibility, Best Practices y SEO
- [ ] Core Web Vitals: LCP < 2,5 s, INP < 200 ms, CLS < 0,1

## Accesibilidad

- [ ] Navegable con teclado; foco visible; skip-link funciona
- [ ] Menú móvil: `aria-expanded` correcto, `Esc` cierra
- [ ] `prefers-reduced-motion` respetado
- [ ] Contraste ≥ 4,5:1 tras personalizar `tokens.css`
- [ ] Todas las imágenes de contenido con `alt` descriptivo

## Legal y analítica

- [ ] Aviso legal, privacidad y cookies revisados por un asesor
- [ ] Banner: sin cookies `_ga` antes de aceptar; aceptar/rechazar con el mismo peso visual
- [ ] Eventos de conversión (`data-track`) visibles en GA4 DebugView tras aceptar
- [ ] Formulario probado de extremo a extremo (recepción del email/lead)

## Seguridad y servidor

- [ ] `pnpm audit` sin vulnerabilidades altas
- [ ] Headers verificados (securityheaders.com): CSP, X-Frame-Options, nosniff, Referrer-Policy
- [ ] HTTPS operativo → activar HSTS en `deploy/nginx/default.conf.template`
- [ ] Dominio alternativo (`www` ↔ raíz) redirigido con 301 en el proxy
