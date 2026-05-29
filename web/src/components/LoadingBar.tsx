import styles from "./LoadingBar.module.css";

interface Props {
  isLoading: boolean;
}

export default function LoadingBar({ isLoading }: Props) {
  return (
    <div className={`${styles.bar}${isLoading ? ` ${styles.active}` : ""}`}>
      <div className={styles.indicator} />
    </div>
  );
}
