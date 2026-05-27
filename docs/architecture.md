# Arquitectura

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express 5 + TypeScript |
| Datos externos | Radio Browser API (`de1.api.radio-browser.info`) |
| Persistencia local | localStorage (browser) |
| Deploy backend | Render (`radio-c868.onrender.com`) |

## Diagrama de capas

```
Browser
  └── React App (Vite)
        ├── UI Components (Tuner, BandSwitch, AudioPlayer)
        ├── State (React hooks + localStorage)
        └── HTTP client (Axios → VITE_API_URL)
              │
              ▼
        Express API (:3000)
          └── GET /radios/buenos-aires
                └── Pipeline:
                      fetch (Radio Browser API)
                        → filter (BA + valid stream)
                        → map (normalize fields)
                        → dedupe (by name)
                        → sort (AM first, then by frequency)
```

## Estructura de archivos

```
radio/
├── docs/                      ← esta carpeta
├── backend/
│   ├── src/
│   │   ├── index.ts           ← servidor Express, rutas montadas
│   │   ├── routes/
│   │   │   └── radioRoutes.ts ← GET /radios/buenos-aires
│   │   ├── services/
│   │   │   └── radioService.ts← orquesta el pipeline completo
│   │   ├── providers/
│   │   │   └── radioBrowser.ts← fetch a Radio Browser API
│   │   ├── mappers/
│   │   │   └── radioMapper.ts ← RadioBrowserStation → RadioStation
│   │   ├── filters/
│   │   │   └── radioFilters.ts← isBuenosAires, hasValidStream, dedupe, filterNearby
│   │   ├── sorters/
│   │   │   └── radioSorters.ts← AM antes que FM, luego por frecuencia numérica
│   │   ├── models/
│   │   │   └── radioStation.ts← tipos RadioStation y RadioBrowserStation
│   │   └── utils/
│   │       └── radioUtils.ts  ← extractFrequency, detectBand, getDistanceKm (Haversine)
│   ├── package.json
│   └── tsconfig.json
│
└── web/
    ├── src/
    │   ├── main.tsx           ← entry point, setea data-theme="default"
    │   ├── App.tsx            ← componente raíz, todo el estado principal
    │   ├── components/
    │   │   ├── TunerSlider.tsx ← slider de frecuencia (AM: 530-1700, FM: 76-108)
    │   │   ├── BandSwitch.tsx  ← toggle AM/FM
    │   │   └── AudioPlayer.tsx ← player con volumen, mute, play/pause
    │   ├── helpers/
    │   │   ├── tuning.ts       ← resolveStationByTuning, getUserLocation
    │   │   ├── snapToStations.ts ← encuentra estación más cercana a frecuencia
    │   │   └── getSavedFrequency.tsx ← lee localStorage o retorna defaults
    │   ├── services/
    │   │   └── api.ts          ← instancia Axios con VITE_API_URL
    │   ├── types/
    │   │   └── radioStation.ts ← RadioStation (frontend), TuningMode
    │   ├── themes/
    │   │   └── default.css     ← variables CSS del tema
    │   └── index.css / App.css
    ├── .env                    ← VITE_API_URL
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```
