// components/Buttons.tsx
"use client";
import styles from "./Buttons.module.css";
import Link from 'next/link';
import { useSession } from "next-auth/react";

const Buttons: React.FC = () => {
  const { data: session } = useSession();
  return (
    <div className={styles.buttons}>
      {!session ? (
        // 未ログイン時の表示
        <>
          <Link href="/auth/login">
            <button className={`${styles.button} ${styles.login}`}>ログイン 🔑</button>
          </Link>
          <Link href="/auth/register">
            <button className={`${styles.button} ${styles.register}`}>新規登録 📝</button>
          </Link>
        </>
      ) : (
        // ログイン時の表示
        <div className={styles.roomButtons}>
          <Link href="/createRoom">
            <button className={`${styles.doubleButton} ${styles.createRoom}`}>ルーム作成 ✏️</button>
          </Link>
          <Link href="/searchRoom">
            <button className={`${styles.doubleButton} ${styles.searchRoom}`}>ルーム検索 🔍</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Buttons;
