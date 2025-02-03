// components/Sidebar.tsx
import styles from "./Sidebar.module.css";
import Link from 'next/link'

const Sidebar: React.FC = () => {
  return (
    <div className={styles.sidebar}>
      <Link href="Friends"><div className={styles.item}>👥 フレンド</div></Link>
      <Link href="/"><div className={styles.item}>🏠 ホーム</div></Link>
      <div className={styles.item}>⚙️ 設定</div>
      <Link href="Profile"><div className={styles.item}>👤 プロフィール</div></Link>
      <div className={styles.item}>✉️ メッセージ</div>
    </div>
  );
};

export default Sidebar;
