'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Header from "./components/Header";
import Profile from "./components/Profile";
import Buttons from "./components/Buttons";
import styles from "./page.module.css";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className={styles.container}>
      <div className={styles.contentSection}>
        <div className={styles.headerSection}>
          <Header />
          {session && (
            <button
              onClick={() => signOut()}
              className={styles.logoutButton}
            >
              ログアウト
            </button>
          )}
        </div>
        {session ? (
          <div className={styles.mainSection}>
            <Profile />
            <Buttons />
          </div>
        ) : (
          <div className={styles.loginSection}>
            <div className={styles.authButtons}>
              <button
                onClick={() => signIn()}
                className={styles.loginButton}
              >
                ログイン
              </button>
              <button
                onClick={() => window.location.href = '/auth/register'}
                className={styles.registerButton}
              >
                新規登録
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
