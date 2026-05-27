# Data Model

## Tipos principales

### `RadioBrowserStation` (backend/src/models/radioStation.ts)

Tipo crudo que refleja la respuesta de Radio Browser API. Todos los campos son string o nullable.

```ts
type RadioBrowserStation = {
  stationuuid: string
  name: string
  url_resolved: string
  favicon: string
  homepage: string
  country: string
  state: string
  tags: string           // coma-separado
  codec: string
  bitrate: string
  geo_lat: string | null
  geo_long: string | null
}
```

### `RadioStation` (tipo interno normalizado)

Usado en backend y frontend (con leves diferencias de opcionalidad).

```ts
type RadioStation = {
  id: string
  name: string
  streamUrl: string
  favicon?: string
  homepage?: string
  country?: string
  state?: string
  tags: string[]
  codec?: string
  bitrate?: number
  frequency?: string | null   // extraída del nombre, ej: "95.5"
  band?: "AM" | "FM"
  lat?: number | null
  lng?: number | null
}
```

### `TuningMode` (web/src/types/radioStation.ts)

```ts
type TuningMode = "CONTINUOUS" | "SNAP"
```

Solo `"SNAP"` está implementado. `"CONTINUOUS"` está reservado para futura interpolación de señal.

## Persistencia en localStorage

| Key | Tipo | Descripción |
|-----|------|-------------|
| `band` | `"AM" \| "FM"` | Última banda seleccionada |
| `frequency_AM` | `number` | Última frecuencia AM |
| `frequency_FM` | `number` | Última frecuencia FM |
| `selectedRadio_AM` | `string` (JSON) | Última estación AM seleccionada |
| `selectedRadio_FM` | `string` (JSON) | Última estación FM seleccionada |
| `volume` | `number` | Volumen del player (0–1) |

## Flujo de transformación de datos

```
Radio Browser API
  │  { stationuuid, name, url_resolved, state, geo_lat, ... }
  │
  ▼ filter: isBuenosAiresStation + hasValidStream
  │
  ▼ map: mapRadioStation()
  │  { id, name, streamUrl, tags[], frequency, band, lat, lng, ... }
  │
  ▼ removeDuplicateStations()
  │
  ▼ sortByBandAndFrequency()
  │  [ AM stations sorted by freq..., FM stations sorted by freq... ]
  │
  ▼ HTTP response JSON
  │
  ▼ React state: radios[]
```
