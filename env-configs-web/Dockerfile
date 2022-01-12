FROM node:14.16.0-alpine as node
WORKDIR '/app'
ENV CI=true
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run test
RUN npm run build

FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=node /app/build /usr/share/nginx/html