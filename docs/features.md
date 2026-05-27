# Features

## Tuner / Dial

El slider central de la UI. Simula el dial físico de una radio analógica.

- Rango AM: 530 – 1700 kHz
- Rango FM: 76 – 108 MHz
- Mientras se arrastra: muestra `previewRadio` (visual feedback)
- Al soltar (`mouseup` / `touchend`): ejecuta `resolveStationByTuning` y activa la estación más cercana a esa frecuencia
- No hay debounce continuo; la selección real ocurre solo al soltar

La frecuencia actual se guarda en localStorage por banda (`frequency_AM`, `frequency_FM`).

## Banda AM/FM

Toggle que cambia entre las dos bandas. Cada banda tiene memoria independiente:

- Frecuencia guardada → se restaura al volver a la banda
- Última estación seleccionada → se restaura el stream al volver

Al cambiar de banda el dial se reposiciona en la frecuencia guardada para esa banda.

## Audio Player

Player fijo en bottom-right. No es un reproductor genérico: está integrado con la lógica del tuner.

- **Play/Pause**: toggle manual
- **Mute**: silencia sin perder el volumen configurado
- **Volumen**: slider vertical, persiste en localStorage
- **Auto-play**: cuando `selectedRadio` cambia (usuario sintoniza nueva estación), el player arranca solo

Usa el elemento `<audio>` nativo del browser con la `streamUrl` de la estación activa.

## Nearby Mode (experimental)

Permite filtrar las estaciones visibles en el dial por proximidad geográfica al usuario.

**Cómo funciona:**
1. Se obtiene la ubicación del usuario via `getUserLocation()` (Geolocation API del browser)
2. Se envía `lat`, `lng`, `radiusKm` al backend como query params en `/radios/buenos-aires`
3. El backend aplica `filterNearby()` usando Haversine antes de responder
4. Solo las estaciones dentro del radio aparecen en el dial

**Radios de cobertura simulados:**
- FM: 75 km (cobertura típica de transmisores urbanos)
- AM: 300 km (AM viaja mucho más lejos, especialmente de noche)

**Consideraciones de diseño:**
- El nearby mode **no altera el orden del dial**: las estaciones filtradas siguen posicionadas por su frecuencia real
- Solo aparecen estaciones que tengan coordenadas (`lat` / `lng`) registradas en Radio Browser API
- El radio cambia automáticamente al cambiar de banda (FM ↔ AM) mientras nearby está activo
- Al desactivar nearby, se vuelve a pedir la lista completa de Buenos Aires
