FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm install --no-audit --no-fund
COPY . .

FROM base AS dev
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

FROM base AS build
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
