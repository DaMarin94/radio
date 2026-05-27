# Desarrollo local

## Requisitos

- Node.js 18+
- npm

## Setup inicial

```bash
# Backend
cd backend
npm install

# Frontend
cd web
npm install
```

## Variables de entorno

`web/.env` (ya existe, copiar de `.env.example` si no):

```
VITE_API_URL=http://localhost:3000
```

## Correr en desarrollo

Dos terminales simultáneas:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Levanta en http://localhost:3000
```

```bash
# Terminal 2 — Frontend
cd web
npm run dev
# Levanta en http://localhost:5173 (por defecto Vite)
```

## Scripts disponibles

### Backend

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `ts-node-dev --respawn --transpile-only src/index.ts` | Dev con hot-reload |
| `build` | `tsc` | Compila a `dist/` |
| `start` | `node dist/index.js` | Corre el build compilado |

### Frontend

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `vite` | Dev server con HMR |
| `build` | `tsc -b && vite build` | Type-check + bundle para producción |
| `preview` | `vite preview` | Preview del build de producción local |
| `lint` | `eslint .` | Lint |

## Endpoints del backend

```
GET /health
→ 200 OK

GET /radios/buenos-aires
→ RadioStation[]   (estaciones de Buenos Aires)

GET /radios/nearby?lat=-34.6&lng=-58.4&radiusKm=75
→ RadioStation[]   (toda Argentina, filtrada por proximidad a las coordenadas)
```

## Deploy

| Servicio | Plataforma | URL |
|---------|-----------|-----|
| Backend | Render | `https://radio-c868.onrender.com` |
| Frontend | (configurar en `.env` antes de build) | — |

Para producción: cambiar `VITE_API_URL` en `web/.env` a la URL de Render antes de `npm run build`.

## Agregar soporte a otra ciudad o país

1. En `backend/src/providers/radioBrowser.ts`: cambiar el país en la URL de fetch
2. En `backend/src/filters/radioFilters.ts`: crear un filtro análogo a `isBuenosAiresStation` para el estado/ciudad deseado
3. En `backend/src/services/radioService.ts`: usar el nuevo filtro en el pipeline
4. Crear un nuevo endpoint en `radioRoutes.ts` si se quiere mantener Buenos Aires en paralelo
