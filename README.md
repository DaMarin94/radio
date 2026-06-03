# Radio

Una **radio analógica** hecha con streams de internet. No es un buscador ni una lista de emisoras: es un tuner con dial físico donde movés la perilla por una banda de frecuencias y la app sintoniza la emisora más cercana. Alcance actual: Buenos Aires, Argentina.

## Estructura

```
radio/
├── backend/          Node + Express 5 + TypeScript (puerto 3000)
└── frontend/         npm workspaces
    ├── shared/       @radio/shared — tipos y helpers puros
    ├── web/          React 19 + Vite + Tailwind (PWA)
    ├── extension/    WXT — Chrome MV3 + Firefox MV2
    └── mobile/       React Native (planeado)
```

## Quick start

```bash
# Backend → http://localhost:3000
cd backend && npm install && npm run dev

# Web → http://localhost:5173
cd frontend/web && npm install && npm run dev
```

El frontend lee la URL del backend desde `VITE_API_URL` (`frontend/web/.env`).

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [docs/product.md](./docs/product.md) | Paraguas conceptual: qué es, para quién, identidad, alcance, decisiones |
| [docs/features.md](./docs/features.md) | Descripción de cada feature |
| [docs/architecture.md](./docs/architecture.md) | Stack, monorepo y estructura de archivos |
| [docs/backend.md](./docs/backend.md) | Endpoints, pipelines, providers, cachés |
| [docs/frontend.md](./docs/frontend.md) | Web y extensión: componentes, estado, helpers, temas |
| [docs/data-model.md](./docs/data-model.md) | Tipos, transformaciones y persistencia |
| [docs/development.md](./docs/development.md) | Setup local y cómo correr el proyecto |
