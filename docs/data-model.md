# Data Model

## Tipos

### `RadioBrowserStation` (backend — `models/radioStation.ts`)

Refleja la respuesta cruda de Radio Browser API. Campos opcionales/nullable.

```ts
type RadioBrowserStation = {
  stationuuid: string
  name: string
  url_resolved: string
  favicon?: string
  homepage?: string
  country?: string
  countrycode?: string
  state?: string
  iso_3166_2?: string        // ej. "AR-B" (provincia), "AR-C" (CABA)
  tags?: string              // coma-separado
  codec?: string
  bitrate?: number
  geo_lat?: string | null
  geo_long?: string | null
  frequency?: string
  clickcount?: number
  votes?: number
  lastcheckok?: number       // 0 = stream caído
}
```

### `RadioStation` (tipo normalizado)

El backend (`models/radioStation.ts`) lo define con todos los campos presentes (nullable). `@radio/shared` (`types/radioStation.ts`) lo expone para el frontend con algunos opcionales. Forma efectiva:

```ts
type RadioStation = {
  id: string                 // stationuuid
  name: string               // nombre normalizado
  displayName: string        // nombre limpio para mostrar (formatDisplayName)
  streamUrl: string          // url_resolved, forzado a https://
  favicon: string | null
  homepage: string | null
  country: string | null
  state: string | null
  tags: string[]
  codec: string | null
  bitrate: number | null
  frequency: string | null   // ej. "95.5"
  band: "AM" | "FM" | null
  lat: number | null
  lng: number | null
  clickcount: number
  votes: number
}
```

> El pipeline del backend descarta estaciones sin `frequency` **y** `band` (`hasFrequency`), así que en la práctica las estaciones servidas siempre tienen ambos.

### `ReverseGeocodeResult` (backend)

```ts
type ReverseGeocodeResult = {
  city: string
  state: string
  country: string
  countrycode: string   // ISO 3166-1 alpha-2 en mayúsculas, ej. "AR"
}
```

### `TuningMode` (`@radio/shared`)

```ts
type TuningMode = "CONTINUOUS" | "SNAP"
```

Definido en los tipos; la resolución actual (`resolveStationByTuning`) es única para ambos. `CONTINUOUS` está reservado para interpolación futura.

## `@radio/shared`

Lógica pura sin DOM ni framework, reutilizable por web/extension/mobile. Exportado desde `index.ts`:

| Módulo | Exporta |
|--------|---------|
| `types/radioStation` | `RadioStation`, `TuningMode` |
| `helpers/tuning` | `resolveStationByTuning(value, stations, userLocation?)` |
| `helpers/location` | `getUserLocation()` (usa `navigator.geolocation` — solo browser) |
| `helpers/streamRetry` | `StreamRetry` (backoff exponencial 2s→30s) |

## Persistencia (web — localStorage)

| Key | Tipo | Descripción |
|-----|------|-------------|
| `theme` | string | Tema activo (default `"digital"`) |
| `bandFilter` | `"AM" \| "FM"` | Última banda seleccionada |
| `frequency-AM` / `frequency-FM` | number | Última frecuencia por banda |
| `selectedRadio-AM` / `selectedRadio-FM` | string | `id` de la última estación por banda |
| `player-volume` | number (0–1) | Volumen del player |
| `stations-cache` | JSON `{ data, timestamp }` | Caché de la lista de estaciones (TTL 24 h) |

> La extensión usa las mismas estructuras pero sobre `browser.storage.local` (ver frontend.md).

## Flujo de transformación

```
Radio Browser API (countrycode=AR)
  ▼ filter hasValidStream            (name + url_resolved + lastcheckok !== 0)
  ▼ filter isBuenosAiresStation      (iso_3166_2 AR-B/AR-C, o state BA, o sin state)
  ▼ map mapRadioStation              (displayName, https, frequency, band, ...)
  ▼ filter hasFrequency              (descarta sin frequency+band)
  ▼ sort sortByBandAndFrequency      (AM→FM, frecuencia, votos, clicks)
  ▼ [opcional] isWithinAntennaRange  (si llegan lat/lng)
  ▼ HTTP JSON → React: radios[]
```
