# Radio App — Contexto del proyecto

## Estructura

```
radio/
├── backend/          Node + Express 5 + TypeScript  (puerto 3000)
└── frontend/
    ├── shared/       Tipos y helpers compartidos (@radio/shared)
    ├── web/          React 19 + Vite + Tailwind CSS  (puerto 5173)
    ├── extension/    WXT — Chrome MV3 + Firefox MV2
    └── mobile/       React Native (planeado)
```

Ver `docs/` para documentación detallada de arquitectura, pipeline de datos y features.

## Stack y configuración

- TypeScript strict en ambos lados: `noUnusedLocals`, `noUnusedParameters` activos
- Si algo se comenta o desactiva en la UI, limpiar el estado/funciones asociadas para que el build no falle
- El frontend lee la URL del backend desde `VITE_API_URL` (`.env`)
- `@radio/shared` se resuelve via alias de Vite/TypeScript hacia `frontend/shared/src/`

## Comandos frecuentes

```bash
# Dev
cd backend && npm run dev          # http://localhost:3000
cd frontend/web && npm run dev     # http://localhost:5173

# Build
cd frontend/web && npm run build
cd backend && npm run build
```

## Agentes

El workflow de este proyecto está manejado por agentes en `.claude/agents/`:

- **`radio-orchestrator`** — agente por defecto. Analiza, propone, delega y maneja git.
- **`radio-frontend`** — implementa cambios en `frontend/`. Invocado por el orquestador.
- **`radio-backend`** — implementa cambios en `backend/`. Invocado por el orquestador.

## Decisiones de diseño

- **No es una lista de radios** — es un tuner con dial físico. No agregar UI tipo playlist/lista.
- **Nearby mode** está implementado en el backend (`/radios/by-location`, `/radios/nearby`) pero el botón está oculto en la UI intencionalmente. No re-agregar sin que lo pidan.
- **Radio Browser API**: usar siempre `all.api.radio-browser.info` (round-robin). Nunca hardcodear un server específico (`de1`, `de2`, etc.).
- **Frecuencias que se pisan**: el tiebreaker es `votes` → `clickcount` descendente, luego distancia al usuario si ambas tienen coordenadas.
- **Estaciones sin `state`** en Radio Browser se incluyen en el filtro de Buenos Aires (muchas radios BA legítimas no tienen ese campo completo, e.g. Blue 100.7, Aspen).
- **`@radio/shared`**: lógica pura reutilizable sin DOM ni framework. Si algo lo necesitan dos o más de web/extension/mobile → va en shared.

## Cuando algo no aparece en el dial

Checklist:
1. ¿Tiene `url_resolved` no vacía y `lastcheckok !== 0`? (`hasValidStream`)
2. ¿Tiene `iso_3166_2: "AR-B"/"AR-C"`, o `state` con "buenos aires", o `state` vacío? (`isBuenosAiresStation`)
3. ¿Tiene frecuencia extraíble del nombre? (regex `\d{2,4}(?:\.\d)?`)
4. ¿Tiene `band` detectable? (texto "AM"/"FM" en el nombre, o frecuencia en rango)
