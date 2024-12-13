import styles from './profile.module.css';

export default function ProfilePage() {
  return (
    <div className={styles.profilePage}>
      <header className={styles.header}>
        <h1>プロフィール</h1>
        <button className={styles.editButton}>編集</button>
      </header>
      <div className={styles.profileCard}>
        <div className={styles.avatar}></div>
        <div className={styles.info}>
          <p>
            <strong>生年月日:</strong> 2002年
          </p>
          <p>
            <strong>名前:</strong> カザンオールスターズ
          </p>
          <p>
            <strong>自己紹介:</strong>
          </p>
          <p>
            こんにちは！私は洋楽が好きな専門学生です！
            仲良くしてください！
          </p>
        </div>
      </div>
    </div>
  );
}
