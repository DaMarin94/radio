import * as Switch from "@radix-ui/react-switch";
import styles from "./BandSwitch.module.css";

type Props = {
  value: "AM" | "FM";
  onChange: (value: "AM" | "FM") => void;
};

function BandSwitch({ value, onChange }: Props) {
  return (
    <Switch.Root
      checked={value === "FM"}
      onCheckedChange={(checked) => onChange(checked ? "FM" : "AM")}
      className={styles.root}
    >
      <span className={`${styles.label} ${value === "AM" ? styles.active : styles.inactive}`}>
        AM
      </span>
      <Switch.Thumb className={styles.thumb} />
      <span className={`${styles.label} ${value === "FM" ? styles.active : styles.inactive}`}>
        FM
      </span>
    </Switch.Root>
  );
}

export default BandSwitch;
