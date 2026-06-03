# Features

## Tuner / Dial

El dial central (`TunerWheel` en web). Simula la perilla de una radio analógica.

- Rango AM: 530 – 1700 kHz
- Rango FM: 76 – 108 MHz
- Mientras se arrastra: muestra `previewRadio` (feedback visual) y, con debounce de 300 ms, sintoniza.
- Al soltar: `resolveStationByTuning` fija la estación más cercana y registra el click (`POST /radios/click/:id`).

La frecuencia se guarda por banda (`frequency-AM`, `frequency-FM`).

## Banda AM/FM

Toggle que cambia de banda. Cada banda tiene memoria independiente (frecuencia y última estación). Al cambiar, el dial mantiene su posición normalizada y resuelve la estación correspondiente en la nueva banda.

## Audio Player

Player integrado con el tuner (no es un reproductor genérico). Usa `<audio>` nativo con la `streamUrl` de la estación activa.

- **Play/Pause** y **Mute**
- **Volumen**: slider vertical, persiste en `player-volume`. **Se oculta en mobile** (se usan los botones físicos).
- **Auto-play** al cambiar `selectedRadio`; maneja el bloqueo de autoplay del browser con un overlay "toca para empezar".
- **Reintentos**: `StreamRetry` (`@radio/shared`) con backoff exponencial 2s→30s ante `error`/`ended`.

### Ruido estático entre estaciones (web)

Mientras se sintoniza o el stream aún no está listo, el `AudioPlayer` genera ruido blanco con la Web Audio API (a ~8% del volumen) para reforzar la sensación de "buscar señal". Es específico de la web.

## Indicador de carga

Barra animada (`LoadingBar`) que se activa durante la carga inicial de la lista de radios y durante el buffering del stream. Presente en web y en la extensión (en la extensión el estado de buffering viaja background → popup; ver frontend.md).

## Now playing (planeado, deshabilitado)

Pensado para mostrar la canción que suena (artista — título) debajo del nombre de la estación. Backend (`/radios/nowplaying/:id`) y frontend (`useNowPlaying`) están integrados pero **deshabilitados**: hoy devuelven `null`. Se activará al completar la integración de metadata ICY + reconocimiento AudD.

## Nearby mode (oculto en la UI)

Filtra las estaciones por proximidad/región del usuario. El botón está **oculto a propósito** (ver product.md); la infraestructura existe en el backend.

Tres variantes en el backend:

- **Alcance de antena** — `GET /radios/buenos-aires?lat=&lng=`: filtra la lista BA con `isWithinAntennaRange` (FM **50 km**, AM **500 km**). Estaciones sin coordenadas se incluyen.
- **By-location** — `GET /radios/by-location?lat=&lng=`: reverse geocode → estaciones del país matcheadas a la ciudad/región (la más completa; trae radios sin coordenadas que pertenezcan a la zona).
- **Geo puro** — `GET /radios/nearby?lat=&lng=&radiusKm=`: solo estaciones con coordenadas dentro del radio.

El nearby mode **no altera el orden del dial**: las estaciones siguen posicionadas por su frecuencia real.
