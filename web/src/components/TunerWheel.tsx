import { useEffect, useRef, useState } from "react";
import styles from "./TunerWheel.module.css";

type Band = "AM" | "FM";

type Props = {
  band: Band;
  value: number;
  onChange: (value: number) => void;
  onRelease: (value: number) => void;
  orientation?: "vertical" | "horizontal";
};

const SCALES = {
  FM: { min: 76, max: 108, step: 0.1, precision: 10 },
  AM: { min: 530, max: 1700, step: 10, precision: 1 },
} as const;

// Vertical layout
const ITEM_H = 44;
const V_HALF_VISIBLE = 2;
const V_HALF_RENDER = V_HALF_VISIBLE + 2;
const V_CONTAINER_H = (V_HALF_VISIBLE * 2 + 1) * ITEM_H;
const V_CENTER_Y = V_CONTAINER_H / 2;

// Horizontal layout
const H_ITEM_W = 12;
const H_HALF_RENDER = 22;
const H_CONTAINER_W = 400;
const H_CENTER_X = H_CONTAINER_W / 2;
const TICK_BASELINE = 42;
const TICK_LARGE = 24;
const TICK_MEDIUM = 16;
const TICK_SMALL = 8;

function snap(val: number, precision: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(val * precision) / precision));
}

function isLabelFreq(freq: number, band: Band): boolean {
  if (band === "FM") return Math.abs(freq - Math.round(freq)) < 0.005;
  return freq % 100 === 0;
}

function isMediumFreq(freq: number, band: Band): boolean {
  if (isLabelFreq(freq, band)) return false;
  if (band === "FM") return Math.abs(freq * 2 - Math.round(freq * 2)) < 0.005;
  return freq % 50 === 0;
}

function TunerWheel({ band, value, onChange, onRelease, orientation = "horizontal" }: Props) {
  const { min, max, step, precision } = SCALES[band];
  const [dragOffset, setDragOffset] = useState(0);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef(0);
  const startValueRef = useRef(value);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onReleaseRef = useRef(onRelease);
  onReleaseRef.current = onRelease;

  if (!isDraggingRef.current) startValueRef.current = value;

  const ITEM_SIZE = orientation === "horizontal" ? H_ITEM_W : ITEM_H;
  const liveK = Math.round(-dragOffset / ITEM_SIZE);
  const liveValue = snap(startValueRef.current + liveK * step, precision, min, max);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { min: sMin, max: sMax, step: wStep, precision: prec } = SCALES[band];
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const raw = orientation === "horizontal" && e.deltaX !== 0 ? e.deltaX : e.deltaY;
      const delta = raw > 0 ? -wStep : wStep;
      const next = snap(valueRef.current + delta, prec, sMin, sMax);
      onChangeRef.current(next);
      onReleaseRef.current(next);
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [band, orientation]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDraggingRef.current = true;
    startPosRef.current = orientation === "horizontal" ? e.clientX : e.clientY;
    startValueRef.current = valueRef.current;
    setDragOffset(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    const { min: sMin, max: sMax, step: wStep, precision: prec } = SCALES[band];
    const pos = orientation === "horizontal" ? e.clientX : e.clientY;
    const raw = pos - startPosRef.current;
    const maxPos = ((startValueRef.current - sMin) / wStep) * ITEM_SIZE;
    const maxNeg = ((sMax - startValueRef.current) / wStep) * ITEM_SIZE;
    const offset = Math.min(maxPos, Math.max(-maxNeg, raw));
    setDragOffset(offset);
    const k = Math.round(-offset / ITEM_SIZE);
    onChangeRef.current(snap(startValueRef.current + k * wStep, prec, sMin, sMax));
  }

  function handlePointerUp(_e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    onReleaseRef.current(liveValue);
    startValueRef.current = liveValue;
    setDragOffset(0);
  }

  // ── Horizontal mode ────────────────────────────────────────────────────────

  if (orientation === "horizontal") {
    const ticks: React.ReactNode[] = [];

    for (let k = liveK - H_HALF_RENDER; k <= liveK + H_HALF_RENDER; k++) {
      const rawFreq = startValueRef.current + k * step;
      if (rawFreq < min - 1e-9 || rawFreq > max + 1e-9) continue;
      const freq = snap(rawFreq, precision, min, max);
      const xPos = H_CENTER_X + k * H_ITEM_W + dragOffset;
      if (xPos < -H_ITEM_W * 2 || xPos > H_CONTAINER_W + H_ITEM_W * 2) continue;

      const label = isLabelFreq(freq, band);
      const medium = !label && isMediumFreq(freq, band);
      const tickH = label ? TICK_LARGE : medium ? TICK_MEDIUM : TICK_SMALL;
      const dist = Math.abs(xPos - H_CENTER_X) / H_ITEM_W;
      const opacity = Math.max(0.12, 1 - dist * 0.045);

      ticks.push(
        <div
          key={`t-${k}`}
          className={styles.tick}
          style={{ left: xPos - 1, top: TICK_BASELINE - tickH, height: tickH, opacity }}
        />
      );

      if (label) {
        ticks.push(
          <div
            key={`l-${k}`}
            className={styles.tickLabel}
            style={{ left: xPos, opacity }}
          >
            {band === "FM" ? Math.round(freq) : freq}
          </div>
        );
      }
    }

    return (
      <div
        ref={containerRef}
        className={styles.drumH}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {ticks}
        <div className={styles.needle} />
      </div>
    );
  }

  // ── Vertical mode ──────────────────────────────────────────────────────────

  const items: React.ReactNode[] = [];
  for (let k = liveK - V_HALF_RENDER; k <= liveK + V_HALF_RENDER; k++) {
    const rawFreq = startValueRef.current + k * step;
    if (rawFreq < min - 1e-9 || rawFreq > max + 1e-9) continue;
    const freq = snap(rawFreq, precision, min, max);
    const yCenter = V_CENTER_Y + k * ITEM_H + dragOffset;
    if (yCenter < -ITEM_H || yCenter > V_CONTAINER_H + ITEM_H) continue;

    const dist = Math.abs(yCenter - V_CENTER_Y) / ITEM_H;
    const opacity = Math.max(0, 1 - dist * 0.5);
    const scaleY = Math.max(0.6, 1 - dist * 0.18);
    const isCenter = k === liveK;

    items.push(
      <div
        key={`${k}-${freq}`}
        className={`${styles.item} ${isCenter ? styles.itemCenter : ""}`}
        style={{
          top: yCenter - ITEM_H / 2,
          opacity,
          transform: `scaleY(${scaleY})`,
        }}
      >
        {freq}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.drum}
      style={{ "--item-h": `${ITEM_H}px` } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {items}
      <div className={styles.centerBorderTop} />
      <div className={styles.centerBorderBottom} />
    </div>
  );
}

export default TunerWheel;
