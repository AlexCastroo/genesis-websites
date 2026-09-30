# Genesis Web Base

Plantilla Astro para arrancar la web de **cualquier negocio** con SEO técnico, GEO (buscadores de IA), accesibilidad, analítica con consentimiento y despliegue Docker + Nginx de serie.

## Requisitos

- Node `>=22.12.0`
- pnpm `11.1.1` (`npm i -g pnpm@11.1.1` o `corepack enable`)
- Docker (solo para desplegar)

## Comandos

| Comando                        | Acción                                                       |
| ------------------------------ | ------------------------------------------------------------ |
| `pnpm install`                 | Instala dependencias (endurecido: ver `pnpm-workspace.yaml`) |
| `pnpm dev`                     | Servidor de desarrollo en `http://localhost:4321`            |
| `pnpm build`                   | Genera `dist/` y `deploy/nginx/redirects.conf`               |
| `pnpm preview`                 | Sirve `dist/` en local                                       |
| `pnpm check`                   | Tipos + comprobaciones i18n/contenido + tests                |
| `pnpm verify`                  | Audita el HTML generado (h1, canonical, JSON-LD, imágenes)   |
| `pnpm test`                    | Tests unitarios (Vitest)                                     |
| `docker compose up -d --build` | Construye y sirve en `http://localhost:8080`                 |

## Dónde se cambia cada cosa

| Qué                                                                                        | Dónde                                                                 |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Datos del negocio (dominio, nombre, contacto, dirección, horarios, redes, tipo schema.org) | `src/config/site.ts`                                                  |
| Menú                                                                                       | `src/config/nav.ts`                                                   |
| Redirecciones 301                                                                          | `src/config/redirects.ts`                                             |
| Idiomas                                                                                    | `src/i18n/config.ts` + `src/i18n/ui/<lang>.ts` + `src/i18n/routes.ts` |
| Textos de la interfaz                                                                      | `src/i18n/ui/*.ts`                                                    |
| URLs traducidas                                                                            | `src/i18n/routes.ts`                                                  |
| Servicios, blog, FAQ, legales                                                              | `src/content/<colección>/<lang>/*`                                    |
| Marca visual (colores, tipografía, espaciado)                                              | `src/styles/tokens.css` y la fuente en `astro.config.ts`              |
| Imágenes de marca                                                                          | `public/` (favicon, logo, OG) y `src/assets/`                         |
| Analítica / formulario                                                                     | `.env` (ver `.env.example`)                                           |

## Documentación

- [Crear un proyecto nuevo desde la base](docs/new-project.md)
- [Checklist de lanzamiento](docs/launch-checklist.md)
- [Base de conocimiento (por qué está hecho así)](docs/knowledge-base.md)
- [Spec de diseño](docs/superpowers/specs/2026-09-30-web-base-design.md)
