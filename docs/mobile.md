# Mobile

App nativa de Radio en **React Native + Expo**. Es la misma experiencia que la web (ver `product.md` §6.2), no un producto aparte. Su razón de ser es **accesibilidad/alcance** (el teléfono es el dispositivo que casi todos tienen).

> Estado: **scaffold inicial** (bootea, sin features del v1 implementadas).

## Stack

| Pieza | Elección |
|-------|----------|
| Framework | Expo SDK 56 (managed) + TypeScript strict |
| Plataformas | iOS + Android |
| Audio | react-native-track-player v4 (background + lock screen) |
| Estilos | NativeWind v4 (Tailwind vía `className`) |
| Persistencia | AsyncStorage |
| Navegación | ninguna (una sola pantalla) |
| Código compartido | `@radio/shared` vía Metro |

## Estructura

```
frontend/mobile/
├── App.tsx               UI raíz
├── index.ts              bootstrap (root + PlaybackService de track-player)
├── app.json              config Expo (background audio + permisos)
├── babel.config.js       babel-preset-expo + nativewind + reanimated
├── metro.config.js       monorepo + resolución de @radio/shared + withNativeWind
├── tailwind.config.js / global.css / nativewind-env.d.ts
├── tsconfig.json         extends expo/tsconfig.base, paths @radio/shared
└── src/{components,hooks,lib,services}
```

`@radio/shared` se consume directo (`import { resolveStationByTuning, type RadioStation } from "@radio/shared"`). Es TS crudo sin build: Metro lo transpila vía `watchFolders` + `resolver` y `tsconfig` lo resuelve por `paths`.

## Cómo correr

track-player es un módulo nativo, así que **NO funciona en Expo Go** — requiere development build:

```bash
cd frontend/mobile
npm install            # desde frontend/ (workspaces) o acá
npx tsc --noEmit       # typecheck
npx expo run:android   # o run:ios — genera dev build y corre
```

`EXPO_PUBLIC_API_URL` (en `.env`) apunta al backend (`http://localhost:3000` en dev).

## Alcance del v1

Mínimo para que valga la pena tener Radio en el teléfono. **Es solo Buenos Aires** (lo que el backend ya sirve).

### Incluye (el core)
- Dial que sintoniza la estación más cercana (`resolveStationByTuning` de `@radio/shared`)
- Audio reproduciéndose
- Banda AM/FM
- Persistencia por banda (frecuencia/estación) en AsyncStorage
- **Reproducción en segundo plano + controles en pantalla bloqueada/notificación** (parte del core, no un extra)

### Fuera del v1 (para después)
- Alcance mundial (el v1 es solo BA)
- Ruido estático entre estaciones (omitido a propósito)
- Temas / selector de temas (un solo look)

### Reglas permanentes
- **Sin slider de volumen in-app** — se usan los botones físicos del teléfono (ver `product.md` §6.3)
- **Autoevidencia** — sin onboarding ni texto guía

### Distribución
- v1: **build interno/beta**, sin stores. Las stores quedan para el futuro.

## Pendientes conocidos del scaffold
- No se corrió el bundle de Metro en runtime (sin emulador en el entorno de scaffold); validar en la primera corrida de dev.
- Faltan assets de íconos/splash en `app.json` (agregar antes de un build real).
- Las features del v1 todavía no están implementadas — el scaffold solo prueba el wiring (`tsc` pasa, `@radio/shared` resuelve).
