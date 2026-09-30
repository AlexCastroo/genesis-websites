# ---------- Build ----------
FROM node:22-alpine AS build
WORKDIR /app

RUN npm install -g pnpm@11.1.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG PUBLIC_GA_ID=""
ARG PUBLIC_CONTACT_ENDPOINT=""
ENV PUBLIC_GA_ID=$PUBLIC_GA_ID \
    PUBLIC_CONTACT_ENDPOINT=$PUBLIC_CONTACT_ENDPOINT

RUN pnpm build

# ---------- Serve ----------
FROM nginxinc/nginx-unprivileged:stable-alpine

COPY deploy/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/deploy/nginx/redirects.conf /etc/nginx/snippets/redirects.conf
COPY --from=build /app/deploy/nginx/contact-origin /etc/nginx/contact-origin
COPY --chmod=755 deploy/nginx/contact-origin.envsh /docker-entrypoint.d/05-contact-origin.envsh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
