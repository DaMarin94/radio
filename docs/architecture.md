# Arquitectura

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend (web) | React 19 + TypeScript + Vite + Tailwind CSS v4 (PWA) |
| Frontend (extensión) | WXT — Chrome MV3 + Firefox MV2 |
| Código compartido | `@radio/shared` — tipos y helpers puros |
| Backend | Node.js + Express 5 + TypeScript |
| Datos de radios | Radio Browser API (`all.api.radio-browser.info`, round-robin DNS) |
| Geocodificación inversa | Nominatim (OpenStreetMap) |
| Reconocimiento de canción | AudD (integrado pero deshabilitado — ver backend.md) |
| Persistencia local | localStorage (web) / browser.storage (extensión) |
| Caché backend | En memoria, `TTLCache` (no hay base de datos) |
| Deploy backend | Render (`radio-c868.onrender.com`) |

## Monorepo

`frontend/` es un workspace de npm con cuatro paquetes; `backend/` es independiente.

```
radio/
├── docs/                         ← esta carpeta
├── backend/
│   └── src/
│       ├── index.ts              ← servidor Express, monta /radios y /health
│       ├── routes/
│       │   └── radioRoutes.ts    ← endpoints REST
│       ├── services/
│       │   └── radioService.ts   ← orquesta pipelines + cachés TTL
│       ├── providers/
│       │   ├── radioBrowser.ts   ← fetch a Radio Browser API
│       │   ├── nominatim.ts      ← reverse geocode (coords → ciudad/país)
│       │   └── audd.ts           ← reconocimiento de canción (planeado)
│       ├── mappers/
│       │   └── radioMapper.ts    ← map + filtros de validez/BA
│       ├── filters/
│       │   └── radioFilters.ts   ← antena, match por ubicación, nearby
│       ├── sorters/
│       │   └── radioSorters.ts   ← orden AM→FM, frecuencia, votos
│       ├── models/
│       │   └── radioStation.ts   ← RadioStation, RadioBrowserStation, ReverseGeocodeResult
│       └── utils/
│           ├── radioUtils.ts     ← extractFrequency, detectBand, formatDisplayName, getDistanceKm
│           └── cache.ts          ← TTLCache genérico con dedup de in-flight
│
└── frontend/                     ← npm workspaces: shared, web, extension, mobile
    ├── shared/src/
    │   ├── types/                ← RadioStation, TuningMode
    │   └── helpers/              ← tuning, location, streamRetry
    ├── web/src/
    │   ├── main.tsx              ← entry; carga temas y DeviceProvider
    │   ├── App.tsx               ← raíz; compone tuner + audio + temas
    │   ├── components/           ← TunerWheel, BandSwitch, AudioPlayer, LoadingBar, ThemePicker
    │   ├── context/              ← DeviceContext (isMobile)
    │   ├── hooks/                ← useTuner, useNowPlaying
    │   ├── services/             ← api.ts (axios + caché localStorage)
    │   ├── helpers/              ← getSavedFrequency
    │   └── themes/               ← default, digital, amber, blue, light, warm
    ├── extension/src/            ← entrypoints (background/offscreen/popup), components, hooks, lib
    └── mobile/                   ← React Native + Expo (scaffold inicial — ver mobile.md)
```

## Diagrama de capas (web)

```
Browser (PWA)
  └── React App (Vite)
        ├── UI (TunerWheel, BandSwitch, AudioPlayer, ThemePicker)
        ├── Estado (useTuner + localStorage) — @radio/shared para lógica pura
        └── HTTP (axios → VITE_API_URL)
              │
              ▼
        Express API (:3000)  /radios/*
          └── radioService (cachés TTL en memoria)
                └── Pipeline buildStationList:
                      fetch (Radio Browser API, countrycode=AR)
                        → filter hasValidStream
                        → map mapRadioStation (normaliza, displayName, https)
                        → filter hasFrequency
                        → sort (AM→FM, frecuencia, votos, clicks)
```
