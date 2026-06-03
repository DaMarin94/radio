# Producto

> Documento vivo de producto. Es el paraguas conceptual de Radio: qué es, para quién, qué principios lo guían y hacia dónde va — en todas sus plataformas (web, extensión, mobile).
>
> Separa lo **decidido** (hechos del producto hoy) de lo **abierto** (decisiones que vamos tomando). Cuando una decisión abierta se cierra, se mueve a la sección que corresponda.
>
> Es el paraguas conceptual, no el roadmap: el alcance de versiones concretas (ej. v1 de mobile) se documenta junto a cada proyecto, no acá.
>
> Para el detalle técnico de cada capa ver `architecture.md`, `backend.md`, `frontend.md`.

---

## 1. Qué es

Radio simula una **radio analógica real** usando streams de internet. La interacción central es un **dial físico**: el usuario mueve la sintonía por una banda de frecuencias y la app conecta con la emisora más cercana a esa frecuencia.

No es un buscador de radios ni un reproductor de streams. Es la experiencia de **agarrar una radio y mover la perilla**.

## 2. Principios

- Simular el comportamiento de una radio física (dial, bandas AM/FM, "buscar señal").
- Evitar toda UI tipo lista de streams, playlist o reproductor de podcast.
- La interacción táctil con el dial es el punto de entrada principal.
- Separación clara: datos (backend) / interacción (frontend) / reproducción (audio).

## 3. Qué NO es (anti-features)

Decisiones explícitas de lo que el producto **no** hace, para no desviarse:

- **No es una lista de radios.** Nada de UI tipo playlist/listado seleccionable.
- **Nearby mode oculto.** Existe en el backend pero el botón está oculto a propósito. No re-agregar sin pedirlo.

## 4. Para quién (público)

**Público general, sin segmentar.** Radio es para cualquier persona, sin conocimientos previos.

**Principio rector — autoevidencia:** la app debe entenderse **solo desde el diseño**. Alguien que nunca vio una radio analógica tiene que poder usarla sin ninguna ayuda. La carga de "enseñar" recae en los affordances visuales, no en texto.

**Prohibido:** textos guía, tooltips, coach marks, onboarding, instrucciones tipo "deslizá para sintonizar".

**Permitido:** texto *informativo* (frecuencia, nombre de estación) — eso es parte de ser una radio, no una instrucción.

**Contexto de uso:** amplio. De fondo (mientras se hace otra cosa), escucha activa, y en movimiento. Implica que tiene que funcionar sin estar mirándola y sobrevivir cambios de contexto/movimiento.

## 5. Alcance geográfico

**Hoy:** radios de Buenos Aires, Argentina. El backend filtra las estaciones de la provincia/ciudad desde la Radio Browser API global.

**Dirección (futuro cercano):** ser **mundial**. Cualquier persona, en cualquier lugar, sintoniza las radios de donde está.

**Implicaciones a resolver (no ahora):**

- Cómo determina el producto qué región mostrar. La opción más coherente con la metáfora es **automática por ubicación** (una radio capta lo que se emite donde estás), lo que reintroduce la geolocalización como pieza central — a diferencia del nearby actual, que es opcional y oculto.
- Las convenciones de banda y frecuencia (rangos FM/AM, pasos) varían por país/región.

## 6. Plataformas

| Plataforma | Stack | Estado |
|---|---|---|
| Web | React 19 + Vite + Tailwind | En produccion |
| Extension | WXT - Chrome MV3 + Firefox MV2 | En produccion |
| Mobile | React Native + Expo | Scaffold inicial (ver mobile.md) |

### 6.1 Por qué mobile

Mobile no es "el web en el teléfono" ni una experiencia superior: es una cuestión de **accesibilidad y alcance**. El teléfono es el dispositivo que casi todo el mundo tiene — mucha gente no tiene PC. Si el producto es para cualquier persona (ver sección 4), tiene que estar donde esa persona está. Mobile amplía a quién puede llegar Radio.

### 6.2 Identidad entre plataformas

Web y mobile son **la misma experiencia**, no dos productos: mismo concepto, misma interacción, mismo lenguaje visual. La **paridad es la regla**; cualquier divergencia tiene que estar justificada por una limitación real de la plataforma, no por gusto ni conveniencia.

**Diferencias legítimas (arquitectónicas):** método de entrada (mouse vs. táctil), mecánica de reproducción en segundo plano, API de almacenamiento local.

**No legítimas:** rediseñar el dial, agregar/quitar features en una sola plataforma, cambiar el lenguaje visual.

La **extensión** comparte el mismo concepto e identidad, pero es una superficie reducida por su formato (popup): tiene menos features por necesidad de espacio, no por decisión de identidad.

**Consecuencia:** mobile apunta a paridad con web, no a una reinterpretación. Los cambios de producto deberían propagarse entre plataformas para mantener la unidad.

### 6.3 Reglas permanentes por plataforma

**Mobile:**

- **Sin slider de volumen in-app.** El volumen se controla con los botones físicos del teléfono. La web ya esconde el slider en mobile; mobile directamente no lo incluye. Regla permanente, no reabrir.

## 7. Estado de features (transversal)

| Feature | Estado |
|---|---|
| Tuner / dial | Funcional (web, extension) |
| Banda AM/FM separada | Funcional |
| Persistencia por banda | Funcional |
| Audio player custom | Funcional |
| Backend con radios normalizadas | Funcional |
| Nearby mode | En backend, oculto en UI |
| Tuning mode CONTINUOUS | En tipos, no implementado |

---

## Decisiones de producto abiertas

> Lista viva. Cada item es una conversacion pendiente. Cuando se cierra, se documenta arriba.

_(Sin decisiones de producto abiertas por ahora.)_

---

## Bitacora de decisiones

> Registro cronologico de decisiones de producto cerradas, con fecha y motivo.

- **2026-06-03 — Publico y contexto de uso.** Publico general sin segmentar. Se adopta la autoevidencia como principio rector: la app debe entenderse solo desde el diseno, sin texto guia ni onboarding. Contexto de uso amplio (de fondo, escucha activa, en movimiento). Motivo: si es para cualquiera, la facilidad de uso es un requisito, y la metafora de radio fisica es la herramienta de usabilidad que lo habilita.
- **2026-06-03 — Razon de ser de mobile.** Mobile es una cuestion de accesibilidad y alcance, no una experiencia superior ni "el web en el telefono". Motivo: el telefono es el dispositivo que casi todo el mundo tiene y mucha gente no tiene PC; si el producto es para cualquier persona, tiene que estar donde esa persona esta.
- **2026-06-03 — Identidad entre plataformas.** Web y mobile son la misma experiencia (mismo concepto, interaccion y lenguaje visual); la paridad es la regla y la divergencia solo se justifica por una limitacion real de la plataforma. La extension comparte identidad pero es una superficie reducida por su formato. Motivo: es una sola app en varias superficies, no productos distintos.
- **2026-06-03 — Alcance geografico.** Hoy Buenos Aires; la direccion en el futuro cercano es ser mundial (cada persona sintoniza las radios de donde esta). Implicaciones anotadas para resolver mas adelante: determinar la region (probablemente automatica por ubicacion, lo que reintroduce la geolocalizacion como pieza central) y las convenciones de banda/frecuencia que varian por pais.
- **2026-06-03 — Volumen en mobile.** Mobile no lleva slider de volumen in-app, de forma permanente; el volumen se maneja con los botones fisicos del dispositivo. Motivo: el control fisico ya cumple esa funcion y un slider in-app es redundante.
