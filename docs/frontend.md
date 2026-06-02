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

## Extensión (Chrome MV3 / Firefox MV2)

### Arquitectura de audio

En Chrome MV3 el background es un **service worker efímero**: Chrome puede matarlo tras inactividad aunque el offscreen document siga reproduciendo audio. En Firefox MV2 el background es una página persistente con DOM completo; el audio se maneja directamente con `new Audio()` (`directAudio`).

### Reconciliación de `isPlaying` al abrir el popup

Cuando el SW de Chrome se reinicia a mitad de sesión, su estado en memoria arranca con `isPlaying: false` aunque el offscreen siga sonando. Para no mostrar el botón en "pausado" con audio activo, el handler `GET_STATE` reconcilia `isPlaying` con la fuente de audio real antes de responder:

- **Chrome**: si `chrome.offscreen.hasDocument()` devuelve `true`, envía `AUDIO_QUERY` al offscreen document. El offscreen responde `{ playing: !audio.paused }`. El background setea `state.isPlaying = !!state.station && !!response.playing`.
- **Firefox**: lee `!directAudio.paused` directamente.
- Si no hay offscreen document (reinicio real del browser, el offscreen nunca existió), `isPlaying` queda en `false` — comportamiento correcto para no auto-arrancar audio.

`isPlaying` sigue sin persistirse en `browser.storage.local`; la reconciliación solo opera en el momento de responder `GET_STATE`.

### Tipos de mensajes relevantes (extensión)

| Mensaje | Dirección | Descripción |
|---------|-----------|-------------|
| `AUDIO_PLAY` | background → offscreen | Reproduce URL con volumen dado |
| `AUDIO_PAUSE` | background → offscreen | Pausa y limpia currentUrl |
| `AUDIO_SET_VOLUME` | background → offscreen | Ajusta volumen sin interrumpir |
| `AUDIO_QUERY` | background → offscreen | Consulta si el audio está sonando; responde `{ playing: boolean }` |
| `AUDIO_STATUS` | offscreen → background | Notifica cambio en buffering |
| `STATE` | background → popup | Push de estado completo (`PlayerState`) |
