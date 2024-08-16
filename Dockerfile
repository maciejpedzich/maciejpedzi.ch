FROM node:lts-alpine AS build
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build

FROM httpd:2.4-alpine AS runtime
ENV TZ=Europe/Warsaw
RUN apk add --no-cache tzdata
COPY --from=build /app/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=build /app/dist /usr/local/apache2/htdocs/
EXPOSE 80
