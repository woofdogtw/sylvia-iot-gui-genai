FROM nginx:1.29.5-alpine-slim

COPY packages/shell/dist/spa /usr/share/nginx/html

EXPOSE 80
