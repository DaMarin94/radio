# Backend

## Servidor

`src/index.ts` — Express en puerto 3000. Monta CORS y las rutas de radios.

Endpoints disponibles:

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/health` | Healthcheck |
| GET | `/radios/buenos-aires` | Estaciones de Buenos Aires normalizadas |
| GET | `/radios/nearby?lat=X&lng=Y&radiusKm=Z` | Estaciones cercanas a las coordenadas (cualquier país) |

## Pipelines de datos

### `getBuenosAiresStations()` — modo normal

```
getArgentinaStations()            ← /stations/search?countrycode=AR&hidebroken=true
  → filter(isBuenosAiresStation)  ← filtra por state="Buenos Aires"
  → filter(hasValidStream)        ← descarta sin nombre o sin streamUrl
  → map(mapRadioStation)          ← convierte al tipo interno RadioStation
  → filter(removeDuplicateStations)
  → sort(sortByBandAndFrequency)  ← AM primero, luego FM, por frecuencia
```

### `getStationsByLocation(lat, lng)` — nearby mode (principal)

```
reverseGeocode(lat, lng)          ← Nominatim: coords → { city, state, countrycode }
  → getStationsByCountry(countrycode)
      ← /stations/search?countrycode=AR&hidebroken=true
  → filter(hasValidStream)
  → map(mapRadioStation)
  → filter(removeDuplicateStations)
  → sort(sortByBandAndFrequency)
  → filter(stationMatchesLocation)  ← matching flexible city/state vs. state de la estación
  → fallback a todas si < 3 resultados locales
```

Retorna `{ location: { city, state, country, countrycode }, stations: RadioStation[] }`.

La clave: filtra por **ciudad/región real** del usuario — no por distancia geométrica. ASPEN aparece aunque no tenga coordenadas en Radio Browser porque es una radio de Buenos Aires y el usuario está en Buenos Aires.

### `getNearbyStations(lat, lng, radiusKm)` — nearby mode alternativo (geo puro)

```
getStationsNear(lat, lng, radiusKm)
  ← /stations/search?geo_lat=X&geo_long=Y&geo_distance=Zm&has_geo_info=true&hidebroken=true
```

Solo devuelve estaciones con coordenadas en Radio Browser. Disponible en `/radios/nearby` pero el modo by-location es más completo.

## Provider: Radio Browser API

`providers/radioBrowser.ts`

Usa `all.api.radio-browser.info` — round-robin DNS que distribuye entre los servidores disponibles. **Nunca hardcodear un server específico** (`de1`, `de2`, etc.) porque pueden caerse.

| Función | Endpoint | Params clave |
|---------|----------|--------------|
| `getArgentinaStations()` | `/stations/search` | `countrycode=AR`, `hidebroken=true`, `limit=1000` |
| `getStationsByCountry(code)` | `/stations/search` | `countrycode`, `hidebroken=true`, `limit=1000` |
| `getStationsNear(lat, lng, radiusKm)` | `/stations/search` | `geo_lat`, `geo_long`, `geo_distance` (metros), `has_geo_info=true`, `hidebroken=true` |

### Nominatim (`providers/nominatim.ts`)

`reverseGeocode(lat, lng)` — convierte coordenadas a `{ city, state, country, countrycode }`.

Usa `https://nominatim.openstreetmap.org/reverse`. Requiere header `User-Agent` por política de uso. Una sola llamada por interacción del usuario — no hay problema de rate limit.

La API también soporta: `order`, `offset`/`limit`, `bitrateMin`, `tag`, `language`, entre otros.

## Mapper

`mappers/radioMapper.ts`

Convierte `RadioBrowserStation` (campos en snake_case, nullable) al tipo normalizado `RadioStation`:

| Campo fuente | Campo destino | Transformación |
|-------------|---------------|---------------|
| `stationuuid` | `id` | directo |
| `name` | `name` | directo |
| `url_resolved` | `streamUrl` | directo |
| `favicon` | `favicon` | directo |
| `homepage` | `homepage` | directo |
| `country` | `country` | directo |
| `state` | `state` | directo |
| `tags` | `tags` | split por coma |
| `codec` | `codec` | directo |
| `bitrate` | `bitrate` | number |
| `geo_lat` / `geo_long` | `lat` / `lng` | parseFloat o null |
| `name` | `frequency` | `extractFrequency()` |
| `name` | `band` | `detectBand()` |

## Filtros

`filters/radioFilters.ts`

**`isBuenosAiresStation(station)`** — retorna true si `state` contiene "Buenos Aires" (case-insensitive). Solo usado en el modo normal.

**`hasValidStream(station)`** — retorna true si tiene nombre y URL de stream no vacíos.

**`removeDuplicateStations(station, index, self)`** — retiene la primera ocurrencia de cada nombre (case-sensitive exact match).

**`filterNearby(stations, lat, lng, radiusKm)`** — Haversine propio. No se usa en el pipeline actual (la API lo resuelve nativamente), pero disponible para uso local si se necesita.

## Sorter

`sorters/radioSorters.ts`

**`sortByBandAndFrequency(stations)`** — AM antes que FM, dentro de cada banda ascendente por frecuencia numérica. Sin frecuencia → al final de su banda.

## Utils

`utils/radioUtils.ts`

**`extractFrequency(name)`** — regex `(\d{2,4}(?:\.\d)?)` sobre el nombre. `"Rock 95.5 FM"` → `"95.5"`, `"Radio Nacional 870"` → `"870"`. Retorna `null` si no hay match.

**`detectBand(name)`** — busca "AM" o "FM" en el nombre; si no, infiere por rango de frecuencia (76–108 → FM, 500–1700 → AM).

**`getDistanceKm(lat1, lng1, lat2, lng2)`** — fórmula Haversine. Disponible para uso local; no se usa en el pipeline principal.
