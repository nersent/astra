FROM node:18-alpine as deps

RUN apk add --no-cache \
  autoconf \
  automake \
  libtool \
  make \
  tiff \
  jpeg \
  zlib \
  zlib-dev \
  pkgconf \
  nasm file \
  gcc \
  musl-dev \
  libc6-compat \
  vips
WORKDIR /usr/src/app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM node:18-alpine as runner
RUN apk add --no-cache dumb-init

ENV NODE_ENV production
ENV PORT 8080
ENV HOST 0.0.0.0

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules

COPY ./ ./

EXPOSE 8080

CMD ["node", "main.js"]
