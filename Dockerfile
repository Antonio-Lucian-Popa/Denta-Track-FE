# Faza 1: Build Vite App
FROM node:20-alpine as builder

WORKDIR /app

# Copiem doar package.json și package-lock.json pentru cache
COPY package*.json ./
COPY vite.config.ts ./
COPY .env.production ./

# Instalăm dependențele ignorând conflictele de peer-deps
RUN npm install --legacy-peer-deps

# Copiem tot codul sursă
COPY . .

# Construim aplicația pentru producție
RUN npm run build

# Faza 2: Imagine de productie
FROM node:20-alpine as production

WORKDIR /app

# Instalăm un server mic de fișiere statice
RUN npm install -g serve

# Copiem doar fișierele build-uite
COPY --from=builder /app/dist /app/dist

# Portul pe care o să servească aplicația (match la nginx proxy_pass 8083)
EXPOSE 8085

# Comanda de start
CMD ["serve", "-s", "dist", "-l", "8085"]