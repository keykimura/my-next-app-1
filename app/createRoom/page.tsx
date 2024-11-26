import styles from './CreateRoom.module.css';

export default function CreateRoomPage() {
  return (
    <div className={styles.container}>
      <div className={styles.sidebarSpace}></div>
      <div className={styles.formContainer}>
        <div className={styles.iconSection}>
          <div className={styles.icon}></div>
          <div className={styles.icon}></div>
          <div className={styles.icon}></div>
        </div>
        <div className={styles.formSection}>
          <h2 className={styles.title}>ルームを作成</h2>
          <form className={styles.form}>
            <input
              type="text"
              placeholder="ルーム名を入力"
              className={styles.input}
            />
            <select className={styles.select}>
              <option>ジャンルを選択</option>
              <option>ポップ</option>
              <option>ロック</option>
              <option>ジャズ</option>
            </select>
            <select className={styles.select}>
              <option>人数を入力</option>
              <option>1～5人</option>
              <option>6～10人</option>
              <option>11人以上</option>
            </select>
            <button type="submit" className={styles.button}>
              作成
            </button>
          </form>
        </div>
      </div>
   </div>
  );
}