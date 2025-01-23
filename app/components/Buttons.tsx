// components/Buttons.tsx
import styles from "./Buttons.module.css";
import Link from 'next/link'

const Buttons: React.FC = () => {
  return (
    <div className={styles.buttons}>
      <Link href="/createRoom">
      <button className={`${styles.doubleButton} ${styles.createRoom}`}>ルーム作成 ✏️</button>
      </Link>
      <Link href="/searchRoom">
      <button className={`${styles.doubleButton} ${styles.searchRoom}`}>ルーム検索 🔍</button>
      </Link>
    </div>
  );
};

export default Buttons;
