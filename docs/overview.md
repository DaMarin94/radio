# Overview

## Concepto

Radio App simula una radio analógica real usando streams de internet. La idea central es **no ser un buscador de radios**: es un tuner interactivo estilo radio física donde el usuario mueve un dial para sintonizar frecuencias y la app conecta con la emisora más cercana en esa frecuencia.

## Filosofía

- Simular el comportamiento de una radio física real (dial, bandas AM/FM, "buscar señal")
- Evitar la UI tipo "lista de streams" o "reproductor de podcast"
- Priorizar la interacción táctil con el dial como punto de entrada principal
- Mantener separación clara entre datos (backend), interacción (frontend) y reproducción (audio player)

## Alcance actual

Radios de Buenos Aires, Argentina. El backend filtra las estaciones de la provincia/ciudad desde la Radio Browser API global.

## Estado del proyecto

| Feature | Estado |
|---------|--------|
| Tuner / dial | ✅ Funcional |
| Banda AM/FM separada | ✅ Funcional |
| Persistencia por banda | ✅ Funcional |
| Audio player custom | ✅ Funcional |
| Backend con radios normalizadas | ✅ Funcional |
| Deploy frontend + backend | ✅ Funcional |
| Nearby mode (por geolocalización) | ✅ Funcional |
| Tuning mode CONTINUOUS | 🔲 Definido en tipos, no implementado |
