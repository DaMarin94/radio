import { useMemo } from "react";
import styles from "./TunerSlider.module.css";

const SCALES = {
  AM: { min: 530, max: 1700, minorStep: 100, majorStep: 200 },
  FM: { min: 76,  max: 108,  minorStep: 1,   majorStep: 2   },
} as const;

type Band = "AM" | "FM";

type Props = {
  band: Band;
  value: number;
  onChange: (value: number) => void;
  onRelease: (value: number) => void;
};

function generateTicks(band: Band) {
  const { min, max, minorStep, majorStep } = SCALES[band];
  const ticks = [];
  const start = Math.ceil(min / minorStep) * minorStep;
  for (let v = start; v <= max; v += minorStep) {
    ticks.push({
      value: v,
      isMajor: v % majorStep === 0,
      position: ((v - min) / (max - min)) * 100,
    });
  }
  return ticks;
}

function TunerSlider({ band, value, onChange, onRelease }: Props) {
  const amTicks = useMemo(() => generateTicks("AM"), []);
  const fmTicks = useMemo(() => generateTicks("FM"), []);

  const { min, max } = SCALES[band];

  return (
    <div className={styles.slider}>
      <div className={`${styles.scale} ${styles.scaleFm} ${band === "FM" ? styles.scaleActive : styles.scaleInactive}`}>
        {fmTicks.map((tick) => (
          <div
            key={tick.value}
            className={`${styles.tick} ${tick.isMajor ? styles.tickMajor : styles.tickMinor}`}
            style={{ left: `${tick.position}%` }}
          >
            {tick.isMajor && <span className={styles.tickLabel}>{tick.value}</span>}
            <div className={styles.tickLine} />
          </div>
        ))}
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={(e) => onRelease(Number(e.currentTarget.value))}
        onTouchEnd={(e) => onRelease(Number(e.currentTarget.value))}
        className={styles.input}
      />

      <div className={`${styles.scale} ${styles.scaleAm} ${band === "AM" ? styles.scaleActive : styles.scaleInactive}`}>
        {amTicks.map((tick) => (
          <div
            key={tick.value}
            className={`${styles.tick} ${tick.isMajor ? styles.tickMajor : styles.tickMinor}`}
            style={{ left: `${tick.position}%` }}
          >
            <div className={styles.tickLine} />
            {tick.isMajor && <span className={styles.tickLabel}>{tick.value}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TunerSlider;
