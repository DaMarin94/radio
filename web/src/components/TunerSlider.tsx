type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  onRelease: (value: number) => void;
};

function TunerSlider({
  min,
  max,
  value,
  onChange,
  onRelease,
}: Props) {
  return (
    <div className="tuner-slider">
      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        onMouseUp={(e) =>
          onRelease(
            Number(e.currentTarget.value)
          )
        }
        onTouchEnd={(e) =>
          onRelease(
            Number(e.currentTarget.value)
          )
        }
        className="tuner-slider-input"
      />

      <div className="tuner-slider-values">
        <span>{min}</span>

        <span>
          {value.toFixed(1)}
        </span>

        <span>{max}</span>
      </div>
    </div>
  );
}

export default TunerSlider;