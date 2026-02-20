FROM nginx:1.27-alpine

COPY packages/shell/dist/spa /usr/share/nginx/html

EXPOSE 80
