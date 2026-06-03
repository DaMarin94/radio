# Frontend

Cubre la **web** (React 19 + Vite + Tailwind v4, PWA) y la **extensión** (WXT). Ambas consumen `@radio/shared` para la lógica pura del tuner.

## Web

### Entry — `main.tsx`

Importa los 6 temas, setea `data-theme` desde `localStorage["theme"]` (default `"digital"`) y renderiza `<App />` dentro de `<DeviceProvider>`.

### `App.tsx`

Componente raíz. Compone el tuner, el audio, el display y los temas. El estado del tuner vive en el hook `useTuner`; el estado de UI (tema, buffering, error de stream, gesto requerido) vive en `App`.

Render principal:
- `LoadingBar` (carga de radios o buffering)
- Overlay "toca para empezar" cuando el browser bloquea el autoplay (`needsGesture`)
- `BandSwitch` + `AudioPlayer`
- Display de frecuencia + banda
- `TunerWheel` (el dial)
- Nombre de la estación (`displayName`), banda/frecuencia y "now playing" si hay
- `ThemePicker`

### `useTuner` (hook)

Centraliza el estado del dial:

| Devuelve | Descripción |
|----------|-------------|
| `radios` (interno) | Lista completa cargada |
| `frequency` | Frecuencia actual del dial |
| `band` | `"AM" \| "FM"` |
| `selectedRadio` | Estación activa |
| `previewRadio` | Estación bajo el dial mientras se arrastra |
| `isTuning` | `previewRadio !== null` |
| `isLoadingRadios` | Carga inicial |
| `handleFrequencyChange / handleFrequencyRelease / changeBand` | Acciones |

- Al montar: `getUserLocation()` → `fetchStations(loc)` → `radios`. La frecuencia inicial sale de `getSavedFrequency(band)`.
- Mientras se arrastra: `resolveStationByTuning` actualiza `previewRadio`; hay un debounce de 300 ms que también fija `selectedRadio`.
- Al soltar: fija `selectedRadio` y hace `POST /radios/click/:id`.
- Al cambiar banda: mantiene la posición normalizada del dial y restaura/resuelve la estación de la otra banda.
- Persistencia: `bandFilter`, `frequency-${band}`, `selectedRadio-${band}` (ver data-model.md).

### `useNowPlaying` (hook)

`useNowPlaying(station)` → título sonando. **Hoy devuelve `null`**: el polling está deshabilitado hasta completar la integración ICY + AudD (igual que el backend).

### Componentes

- **`TunerWheel`** — el dial en uso. Props: `band`, `value`, `onChange(freq)` (preview mientras se arrastra), `onRelease(freq)` (selección al soltar). Rangos: AM 530–1700 kHz, FM 76–108 MHz. (`TunerSlider` existe como variante de slider lineal pero no se usa en `App`.)
- **`BandSwitch`** — toggle AM/FM (usa `@radix-ui/react-switch`).
- **`AudioPlayer`** — `<audio>` nativo + Web Audio API para el ruido estático entre estaciones. Play/pause, mute, volumen (slider solo en desktop — se oculta en mobile vía `useDevice`). Reintenta con `StreamRetry` de `@radio/shared`. Maneja el bloqueo de autoplay (`needsGesture`). El volumen persiste en `player-volume`.
- **`LoadingBar`** — barra superior animada durante carga/buffering.
- **`ThemePicker`** — selector de tema con preview en hover y confirmación (persiste en `theme`).

### `DeviceContext`

`isMobile` evaluado una vez con `matchMedia("(pointer: coarse)")`. Usado para esconder el slider de volumen en mobile.

### `services/api.ts`

Instancia axios con `VITE_API_URL`. `fetchStations(params?)` cachea la lista en `localStorage["stations-cache"]` con TTL 24 h. El caché no diferencia por ubicación (lat/lng solo afectan orden/tiebreaker, no el conjunto).

### Temas

CSS custom properties con atributo `data-theme` en `<html>`. Temas: `default`, `digital` (default), `amber`, `blue`, `light`, `warm`. Agregar tema = nuevo CSS + import en `main.tsx` + opción en `ThemePicker`.

### Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend. Dev `http://localhost:3000` |

## Extensión (Chrome MV3 / Firefox MV2)

Comparte concepto e identidad con la web pero es una superficie reducida (popup). Solo dark/light auto (sin selector de tema). Estructura: `entrypoints/` (background, offscreen, popup), `components/`, `hooks/` (`useTuner`, `useBackgroundAudio`), `lib/` (`api`, `messages`).

### Arquitectura de audio

En Chrome MV3 el background es un **service worker efímero**: Chrome puede matarlo tras inactividad aunque el offscreen document siga reproduciendo audio. En Firefox MV2 el background es una página persistente con DOM; el audio se maneja directo con `new Audio()` (`directAudio`).

### Reconciliación de `isPlaying` al abrir el popup

Cuando el SW de Chrome se reinicia a mitad de sesión, arranca con `isPlaying: false` aunque el offscreen siga sonando. Para no mostrar "pausado" con audio activo, `GET_STATE` reconcilia `isPlaying` con la fuente real:

- **Chrome**: si `chrome.offscreen.hasDocument()` es `true`, manda `AUDIO_QUERY` al offscreen (responde `{ playing }`) y setea `isPlaying = !!station && !!playing`.
- **Firefox**: lee `!directAudio.paused`.
- Sin offscreen document (reinicio real del browser), `isPlaying` queda en `false`.

`isPlaying` no se persiste; la reconciliación opera solo al responder `GET_STATE`.

### Tipos de mensajes

| Mensaje | Dirección | Descripción |
|---------|-----------|-------------|
| `AUDIO_PLAY` | background → offscreen | Reproduce URL con volumen dado |
| `AUDIO_PAUSE` | background → offscreen | Pausa y limpia currentUrl |
| `AUDIO_SET_VOLUME` | background → offscreen | Ajusta volumen sin interrumpir |
| `AUDIO_QUERY` | background → offscreen | Consulta si suena; responde `{ playing }` |
| `AUDIO_STATUS` | offscreen → background | Notifica cambio de buffering |
| `STATE` | background → popup | Push de estado completo (`PlayerState`) |
