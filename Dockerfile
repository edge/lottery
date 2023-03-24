FROM node:18 AS buildServer

WORKDIR /app

COPY package.json package-lock.json tsconfig.json .
RUN npm install

COPY src ./src
RUN npm run build

FROM node:18 AS buildWeb

WORKDIR /web

COPY web/package.json web/package-lock.json web/tsconfig.json web/tsconfig.node.json web/vite.config.ts web/env.d.ts .
RUN npm install

COPY web/index.html .
COPY web/public ./public
COPY web/src ./src

ARG API_HOST
ARG EXPLORER_HOST

ENV VITE_API_HOST=$API_HOST
ENV VITE_EXPLORER_HOST=$EXPLORER_HOST

RUN npm run build

FROM node:18

WORKDIR /web
COPY --from=buildWeb /web/package.json /web/package-lock.json /web/node_modules /web/dist/ .

WORKDIR /app
COPY --from=buildServer /app/package.json /app/package-lock.json .
COPY --from=buildServer /app/node_modules ./node_modules
COPY --from=buildServer /app/out ./out

ENV STATIC_PATH /web

CMD ["npm", "start"]
