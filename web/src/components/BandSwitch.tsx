type Props = {
  value: "AM" | "FM";

  onChange: (value: "AM" | "FM") => void;
};

function BandSwitch({
  value,
  onChange,
}: Props) {
  function toggle() {
    onChange(value === "AM" ? "FM" : "AM");
  }

  return (
    <div className="band-switch">
      <div
        onClick={toggle}
        className="band-switch-track"
      >
        <div
          className="band-switch-thumb"
          style={{
            left: value === "AM" ? 4 : 60,
          }}
        />

        <div
          className={`
            band-switch-label
            ${value === "AM" ? "active" : "inactive"}
          `}
        >
          AM
        </div>

        <div
          className={`
            band-switch-label
            ${value === "FM" ? "active" : "inactive"}
          `}
        >
          FM
        </div>
      </div>
    </div>
  );
}

export default BandSwitch;