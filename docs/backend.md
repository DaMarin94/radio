# Backend

Node + Express 5 + TypeScript. Sin base de datos: el estado se mantiene con cachés en memoria (`TTLCache`).

## Servidor

`src/index.ts` — Express en puerto 3000 (`PORT` env). Monta CORS, `express.json()`, el router `/radios` y `/health`.

## Endpoints

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/health` | Healthcheck → `{ ok, service }` |
| GET | `/radios/buenos-aires` | Estaciones de Buenos Aires. Con `?lat=&lng=` filtra por alcance de antena |
| GET | `/radios/nearby?lat=&lng=&radiusKm=` | Estaciones con coordenadas dentro del radio (geo puro). Requiere los tres params |
| GET | `/radios/by-location?lat=&lng=` | Reverse geocode → estaciones del país, matcheadas a la ciudad/región. Devuelve `{ location, stations }` |
| GET | `/radios/nowplaying/:id?url=` | Título sonando ahora → `{ title }`. Actualmente devuelve `null` (AudD deshabilitado) |
| POST | `/radios/click/:id` | Registra un click/voto de la estación en Radio Browser. → 204 |

> Nota: la web usa `/radios/buenos-aires` (con `lat`/`lng` opcionales) y `POST /radios/click/:id`. Los endpoints `nearby` y `by-location` son del nearby mode, hoy oculto en la UI.

## Pipeline base — `buildStationList(raw)`

Todas las rutas de listado pasan por el mismo pipeline:

```
filter(hasValidStream)        ← descarta sin nombre/stream o con lastcheckok === 0
  → map(mapRadioStation)      ← normaliza al tipo RadioStation (displayName, https, freq, band)
  → filter(hasFrequency)      ← descarta estaciones sin frequency Y band
  → sort(sortByBandAndFrequency)
```

No hay paso de dedupe en el pipeline actual (existió antes; se removió).

### `getBuenosAiresStations(lat?, lng?)`

```
rawStationsCache("AR")            ← getArgentinaStations (countrycode=AR)
  → buildStationList(raw.filter(isBuenosAiresStation))   ← cacheado en processedBACache("BA")
  → si hay lat/lng: filter(isWithinAntennaRange)
```

### `getStationsByLocation(lat, lng)` — nearby mode (by-location)

```
reverseGeocode(lat, lng)          ← Nominatim: coords → { city, state, country, countrycode }
  → getStationsByCountry(countrycode)
  → buildStationList
  → filter(stationMatchesLocation) ← match flexible city/state vs. state de la estación
  → fallback a todas si hay menos de 3 locales
```

Devuelve `{ location, stations }`. Filtra por **ciudad/región real** del usuario, no por distancia geométrica.

### `getNearbyStations(lat, lng, radiusKm)` — nearby mode (geo puro)

```
getStationsNear(lat, lng, radiusKm)  ← geo_lat/geo_long/geo_distance, has_geo_info=true
  → buildStationList
```

Solo estaciones con coordenadas en Radio Browser.

## Cachés (`utils/cache.ts`)

`TTLCache<T>` genérico, en memoria. `getOrFetch(key, fetcher)` comparte una sola promesa in-flight entre llamadas concurrentes (evita fetches duplicados). `get` devuelve `undefined` en miss y `T` (incluido `null`) en hit.

| Caché | Contenido | TTL |
|-------|-----------|-----|
| `rawStationsCache` | Stations crudas de Argentina | 24 h |
| `processedBACache` | Lista BA ya procesada | 24 h |
| `nowPlayingCache` | Título por estación | 60 s |

## Providers

### Radio Browser (`providers/radioBrowser.ts`)

`BASE_URL = https://all.api.radio-browser.info/json` — round-robin DNS. **Nunca hardcodear un server específico** (`de1`, `de2`).

| Función | Endpoint | Params clave |
|---------|----------|--------------|
| `getArgentinaStations()` | `/stations/search` | `countrycode=AR`, `hidebroken`, `is_https`, `limit=1000` |
| `getStationsByCountry(code)` | `/stations/search` | `countrycode`, `hidebroken`, `is_https`, `limit=1000` |
| `getStationsNear(lat,lng,radiusKm)` | `/stations/search` | `geo_lat`, `geo_long`, `geo_distance` (metros), `has_geo_info`, `limit=500` |
| `clickStation(uuid)` | `/url/:uuid` | registra el click/voto |

### Nominatim (`providers/nominatim.ts`)

`reverseGeocode(lat, lng)` → `{ city, state, country, countrycode }`. Usa `nominatim.openstreetmap.org/reverse` con header `User-Agent`. Una llamada por interacción (sin problema de rate limit).

### AudD (`providers/audd.ts`) — reconocimiento de canción

`recognizeSong(streamUrl)` descarga un chunk del stream (siguiendo redirects y hasta 3 niveles de playlists HLS) y lo envía a la API de AudD; devuelve `"artista — título"`. Requiere `AUDD_API_TOKEN`.

**Estado:** integrado pero **deshabilitado**. `getNowPlaying` no lo invoca todavía (TODO: combinar con metadata ICY antes de gastar créditos de AudD). Hoy `nowplaying` devuelve `null`.

## Mapper (`mappers/radioMapper.ts`)

Contiene el map y los filtros de validez/pertenencia (no están en `filters/`).

- **`hasValidStream(s)`** — `name` y `url_resolved` presentes y `lastcheckok !== 0`.
- **`isBuenosAiresStation(s)`** — si tiene `iso_3166_2`, debe ser `AR-B` (provincia) o `AR-C` (CABA); si no, `state` contiene "buenos aires"; **si no tiene `state`, se incluye** (muchas radios BA legítimas no tienen el campo, e.g. Blue 100.7, Aspen; ya se filtró por `countrycode=AR`).
- **`mapRadioStation(s)`** → `RadioStation`. `displayName` vía `formatDisplayName`; fuerza `https://` en `streamUrl`; `frequency` desde `station.frequency` o `extractFrequency(name)`; `band` vía `detectBand`; `tags` split por coma; `lat`/`lng` parseados o `null`.

## Filtros (`filters/radioFilters.ts`)

- **`isWithinAntennaRange(s, lat, lng)`** — alcance simulado de antena: **FM 50 km, AM 500 km**. Si la estación no tiene coordenadas o no tiene `band`, se incluye (`true`).
- **`stationMatchesLocation(s, location)`** — match normalizado (lowercase, sin acentos) entre `state` de la estación y `city`/`state` del usuario.
- **`filterNearby(stations, lat, lng, radiusKm)`** — Haversine propio. **No se usa** en el pipeline (la API lo resuelve), disponible para uso local.

## Sorter (`sorters/radioSorters.ts`)

**`sortByBandAndFrequency(a, b)`** — comparador: banda primero (AM=0, FM=1, sin banda=2), luego frecuencia ascendente; ante igual frecuencia, **más votos** y luego **más clicks**.

## Utils (`utils/radioUtils.ts`)

- **`formatDisplayName(name)`** — limpia el nombre para mostrar: saca la frecuencia/banda y descriptores, prioriza el patrón banda-primero para no cortar nombres como "La 100 FM 100.1".
- **`extractFrequency(name)`** — prefiere la frecuencia adyacente a "FM"/"AM"; si no, el primer número `\d{2,4}(?:\.\d)?`.
- **`detectBand(name)`** — "FM"/"AM" en el nombre; si no, por rango (76–108 → FM, 500–1700 → AM); si no, `null`.
- **`getDistanceKm(...)`** — Haversine.
