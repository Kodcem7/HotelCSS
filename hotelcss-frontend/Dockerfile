# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# API URL is baked into the build (Vite). Browser reaches the API on the host,
# so this defaults to the API container's published port on localhost.
ARG VITE_API_BASE_URL=http://localhost:5237/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# Optional: address guests' phones use to reach the app over the LAN.
# When set, room QR codes use this instead of the panel's window.location.origin.
ARG VITE_QR_BASE_URL=
ENV VITE_QR_BASE_URL=$VITE_QR_BASE_URL
RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
