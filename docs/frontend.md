# Frontend

## Entry point

`main.tsx` — Setea `document.documentElement.dataset.theme = "default"` y renderiza `<App />`.

## App.tsx — Estado principal

Todo el estado global vive en `App.tsx`:

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `radios` | `RadioStation[]` | Lista completa de estaciones cargadas |
| `frequency` | `number` | Frecuencia actual del dial |
| `bandFilter` | `"AM" \| "FM"` | Banda seleccionada |
| `selectedRadio` | `RadioStation \| null` | Estación activa (reproduciéndose) |
| `previewRadio` | `RadioStation \| null` | Estación bajo el dial (hover/drag) |

Al montar: fetch a `/radios/buenos-aires`, guarda en `radios`. La frecuencia inicial se lee de localStorage con `getSavedFrequency`.

Al cambiar banda: restaura la frecuencia y estación guardada para esa banda desde localStorage.

Al soltar el dial (`onRelease`): llama `resolveStationByTuning` → actualiza `selectedRadio` → guarda en localStorage.

## Componentes

### `TunerSlider.tsx`

Range input continuo. Rango según banda:
- AM: 530 – 1700 kHz
- FM: 76 – 108 MHz

Props:
- `value` — frecuencia actual
- `band` — "AM" | "FM"
- `onChange(freq)` — se dispara mientras se arrastra (preview)
- `onRelease(freq)` — se dispara al soltar (selección real)

Muestra: frecuencia mínima, frecuencia actual, frecuencia máxima.

### `BandSwitch.tsx`

Toggle estilizado AM / FM. Llama `onChange` con la nueva banda al hacer click.

### `AudioPlayer.tsx`

Player de audio fijo en bottom-right. Controla:
- Play / Pause
- Mute
- Volumen (slider vertical)

El volumen persiste en localStorage. Auto-play cuando cambia `selectedRadio`.

## Helpers

### `tuning.ts`

**`resolveStationByTuning(radios, frequency, band, mode)`** — dado un array de estaciones y una frecuencia, retorna la estación con frecuencia más cercana dentro de la banda. Mode puede ser `"SNAP"` o `"CONTINUOUS"` (ambos tienen la misma implementación hoy).

**`getUserLocation()`** — wrapper de `navigator.geolocation.getCurrentPosition` como Promise. Usado para Nearby Mode.

### `snapToStations.ts`

**`snapToStations(stations, frequency)`** — busca la estación con menor diferencia absoluta de frecuencia. Duplica la lógica de `resolveStationByTuning`; candidato a consolidar.

### `getSavedFrequency.tsx`

Lee `localStorage.getItem("frequency_AM")` o `"frequency_FM"`. Si no existe retorna defaults: AM → 710, FM → 90.3.

## Temas

El sistema de temas usa CSS custom properties con el atributo `data-theme` en `<html>`. El tema `"default"` está en `themes/default.css`. Agregar temas nuevos = nuevo archivo CSS + nueva opción en `main.tsx`.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend. Dev: `http://localhost:3000`. Prod: `https://radio-c868.onrender.com` |
