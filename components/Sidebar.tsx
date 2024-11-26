// components/Sidebar.tsx
import styles from "./Sidebar.module.css";

const Sidebar: React.FC = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.item}>👥 フレンド</div>
      <div className={styles.item}>🏠 ホーム</div>
      <div className={styles.item}>⚙️ 設定</div>
      <div className={styles.item}>👤 プロフィール</div>
      <div className={styles.item}>🎵 リスト</div>
      <div className={styles.item}>✉️ メッセージ</div>
    </div>
  );
};

export default Sidebar;
