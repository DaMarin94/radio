import { useEffect, useRef, useState } from "react";
import styles from "./TunerWheel.module.css";

type Band = "AM" | "FM";

type Props = {
  band: Band;
  value: number;
  onChange: (value: number) => void;
  onRelease: (value: number) => void;
};

const SCALES = {
  FM: { min: 76, max: 108, step: 0.1, precision: 10 },
  AM: { min: 530, max: 1700, step: 10, precision: 1 },
} as const;

const ITEM_H = 44;
const HALF_VISIBLE = 2;
const HALF_RENDER = HALF_VISIBLE + 2;
const CONTAINER_H = (HALF_VISIBLE * 2 + 1) * ITEM_H;
const CENTER_Y = CONTAINER_H / 2;

function snap(val: number, precision: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(val * precision) / precision));
}

function TunerWheel({ band, value, onChange, onRelease }: Props) {
  const { min, max, step, precision } = SCALES[band];
  const [dragOffset, setDragOffset] = useState(0);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(value);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onReleaseRef = useRef(onRelease);
  onReleaseRef.current = onRelease;

  // Keep startValue in sync when idle
  if (!isDraggingRef.current) startValueRef.current = value;

  // Drag up (negative offset) = higher frequency
  const liveK = Math.round(-dragOffset / ITEM_H);
  const liveValue = snap(startValueRef.current + liveK * step, precision, min, max);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { min: sMin, max: sMax, step: wStep, precision: prec } = SCALES[band];
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -wStep : wStep;
      const next = snap(valueRef.current + delta, prec, sMin, sMax);
      onChangeRef.current(next);
      onReleaseRef.current(next);
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [band]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startValueRef.current = valueRef.current;
    setDragOffset(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    const { min: sMin, max: sMax, step: wStep, precision: prec } = SCALES[band];
    const raw = e.clientY - startYRef.current;
    const maxDown = ((startValueRef.current - sMin) / wStep) * ITEM_H;
    const maxUp = ((sMax - startValueRef.current) / wStep) * ITEM_H;
    const offset = Math.min(maxDown, Math.max(-maxUp, raw));
    setDragOffset(offset);
    const k = Math.round(-offset / ITEM_H);
    onChangeRef.current(snap(startValueRef.current + k * wStep, prec, sMin, sMax));
  }

  function handlePointerUp(_e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    onReleaseRef.current(liveValue);
    startValueRef.current = liveValue;
    setDragOffset(0);
  }

  // Build items
  const items = [];
  for (let k = liveK - HALF_RENDER; k <= liveK + HALF_RENDER; k++) {
    const freq = snap(startValueRef.current + k * step, precision, min, max);
    const yCenter = CENTER_Y + k * ITEM_H + dragOffset;
    if (yCenter < -ITEM_H || yCenter > CONTAINER_H + ITEM_H) continue;

    const dist = Math.abs(yCenter - CENTER_Y) / ITEM_H;
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
