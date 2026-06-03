# Desarrollo local

## Requisitos

- Node.js 18+
- npm

## Setup inicial

```bash
# Backend
cd backend
npm install

# Frontend (workspaces: instala shared, web, extension, mobile)
cd frontend
npm install
```

`@radio/shared` se resuelve por alias de Vite/TypeScript hacia `frontend/shared/src/` — no requiere build previo.

## Variables de entorno

`frontend/web/.env`:

```
VITE_API_URL=http://localhost:3000
```

Backend (`backend/.env`, opcional):

```
PORT=3000
AUDD_API_TOKEN=...   # solo si se habilita el reconocimiento de canción
```

## Correr en desarrollo

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd backend
npm run dev

# Terminal 2 — Web (http://localhost:5173)
cd frontend/web
npm run dev
```

## Scripts

### Backend (`backend/`)

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `ts-node-dev --respawn --transpile-only src/index.ts` | Dev con hot-reload |
| `build` | `tsc` | Compila a `dist/` |
| `start` | `node dist/index.js` | Corre el build |

### Web (`frontend/web/`)

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `vite` | Dev server con HMR |
| `serve` | `vite --host` | Dev server expuesto en la red local |
| `build` | `tsc -b && vite build` | Type-check + bundle |
| `preview` | `vite preview` | Preview del build |
| `lint` | `eslint .` | Lint |

### Extensión (`frontend/extension/`)

| Script | Descripción |
|--------|-------------|
| `dev` | Dev con WXT (Chrome por defecto) |
| `build` | Build de producción |

## Endpoints del backend

```
GET  /health
GET  /radios/buenos-aires[?lat=&lng=]
GET  /radios/nearby?lat=&lng=&radiusKm=
GET  /radios/by-location?lat=&lng=
GET  /radios/nowplaying/:id?url=
POST /radios/click/:id
```

Detalle en `backend.md`.

## Deploy

| Servicio | Plataforma | URL |
|---------|-----------|-----|
| Backend | Render | `https://radio-c868.onrender.com` |
| Web | Host estático (configurar `VITE_API_URL` antes del build) | — |

## Soporte a otra ciudad/país (estado actual)

El alcance hoy es Buenos Aires. La dirección a futuro (mundial) está en `product.md`. Puntos de extensión actuales:

1. `providers/radioBrowser.ts` — `getStationsByCountry(code)` ya parametriza el país.
2. `mappers/radioMapper.ts` — `isBuenosAiresStation` es el filtro regional a generalizar.
3. `services/radioService.ts` — `getStationsByLocation` ya resuelve país por geocodificación inversa.
