# Radio App — Guía para Claude

## Flujo de trabajo con pedidos

Ante cualquier pedido:
1. Leer el código existente relevante
2. Analizar el impacto en el proyecto (arquitectura, tipos, build, features existentes)
3. Proponer el plan/solución con los archivos a tocar y por qué
4. **Esperar aprobación antes de escribir cualquier código**

## Antes de cualquier commit/push

Siempre correr el build del frontend antes de subir:

```bash
cd frontend/web && npm run build
```

El backend no tiene build check automatizado; si se modificaron archivos `.ts` del backend, verificar que compila con `cd backend && npm run build`.

## Estructura del proyecto

```
radio/
├── backend/          Node + Express 5 + TypeScript  (puerto 3000)
└── frontend/
    ├── shared/       Tipos y helpers compartidos (@radio/shared)
    ├── web/          React 19 + Vite + Tailwind CSS  (puerto 5173)
    ├── extension/    Extensión de navegador (en desarrollo)
    └── mobile/       React Native (planeado)
```

Ver `docs/` para documentación detallada de arquitectura, pipeline de datos y features.

## Qué va en @radio/shared

Antes de implementar lógica nueva, preguntarse: **¿la necesitan dos o más de web / extension / mobile?** Si sí, va en `frontend/shared/src/helpers/` y se exporta desde `index.ts`.

Ejemplos de lo que **sí** va en shared: utilidades puras sin dependencia de DOM o framework (cálculos, clases de estado, backoff/retry, parsers, formatters). Lo que **no** va: hooks de React, componentes, acceso a APIs del browser (`localStorage`, `browser.storage`, `AudioContext`).

## Stack y configuración

- TypeScript strict en ambos lados: `noUnusedLocals`, `noUnusedParameters` activos
- Si algo se comenta o desactiva en la UI, limpiar el estado/funciones asociadas del componente para que el build no falle
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

## Git workflow

1. Hacer los cambios
2. `cd frontend/web && npm run build` — verificar que pasa sin errores
3. Mostrar el diff y proponer el mensaje de commit — **esperar aprobación**
4. Commit recién después del OK
5. Proponer el push — **esperar aprobación** antes de pushear a origin

**IMPORTANTE:** commit y push son dos aprobaciones separadas e independientes. Nunca pushear automáticamente después de un commit, aunque el usuario haya aprobado el commit. Esperar un OK explícito para el push. La única excepción es cuando el usuario dice explícitamente "commitea y pusheá" en el mismo mensaje.

## Decisiones de diseño importantes

- **No es una lista de radios** — es un tuner con dial físico. No agregar UI tipo playlist/lista.
- **Nearby mode** está implementado en el backend (`/radios/by-location`, `/radios/nearby`) pero el botón está oculto en la UI intencionalmente. No re-agregar sin que lo pidan.
- **Radio Browser API**: usar siempre `all.api.radio-browser.info` (round-robin). Nunca hardcodear un server específico (`de1`, `de2`, etc.).
- **Frecuencias que se pisan**: el tiebreaker es `votes` → `clickcount` descendente, luego distancia al usuario si ambas tienen coordenadas.
- **Estaciones sin `state`** en Radio Browser se incluyen en el filtro de Buenos Aires (muchas radios BA legítimas no tienen ese campo completo, e.g. Blue 100.7, Aspen).

## Cuando algo no aparece en el dial

Checklist:
1. ¿Tiene `url_resolved` no vacía y `lastcheckok !== 0`? (`hasValidStream`)
2. ¿Tiene `iso_3166_2: "AR-B"/"AR-C"`, o `state` con "buenos aires", o `state` vacío? (`isBuenosAiresStation`)
3. ¿Tiene frecuencia extraíble del nombre? (regex `\d{2,4}(?:\.\d)?`)
4. ¿Tiene `band` detectable? (texto "AM"/"FM" en el nombre, o frecuencia en rango)
