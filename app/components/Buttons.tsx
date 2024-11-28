// components/Buttons.tsx
import styles from "./Buttons.module.css";

const Buttons: React.FC = () => {
  return (
    <div className={styles.buttons}>
      <button className={`${styles.button} ${styles.createRoom}`}>ルーム作成 ✏️</button>
      <button className={`${styles.button} ${styles.searchRoom}`}>ルーム探索 🔍</button>
    </div>
  );
};

export default Buttons;
