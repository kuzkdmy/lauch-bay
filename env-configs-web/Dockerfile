FROM --platform=$BUILDPLATFORM node:17.9.0-alpine3.14 as node
WORKDIR '/app'
ENV CI=true
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run test
RUN npm run build

FROM --platform=$BUILDPLATFORM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=node /app/build /usr/share/nginx/html
