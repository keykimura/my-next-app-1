import styles from './Room.module.css';

export default function RoomPage() {
  return (
    <div className={styles.roomPage}>
      <h1 className={styles.roomTitle}>ロックを聴く部屋</h1>
      <div className={styles.nowPlaying}>
        <h2>放送中</h2>
        <div className={styles.trackInfo}>
          <p>曲名とか</p>
          <button className={styles.historyButton}>履歴</button>
        </div>
      </div>
      <div className={styles.chatSection}>
        <h2>チャット</h2>
        <div className={styles.chatMessages}>
          <div className={styles.message}>
            <span className={styles.time}>12:19</span>
            <span className={`${styles.bubble} ${styles.gray}`}>この曲いいですね！</span>
          </div>
          <div className={styles.message}>
            <span className={styles.time}>12:19</span>
            <span className={`${styles.bubble} ${styles.blue}`}>ロックいいな</span>
          </div>
          <div className={styles.message}>
            <span className={styles.time}>12:19</span>
            <span className={`${styles.bubble} ${styles.red}`}>誰の曲？</span>
          </div>
          <div className={styles.message}>
            <span className={styles.time}>12:19</span>
            <span className={`${styles.bubble} ${styles.orange}`}>この曲知らなかった</span>
          </div>
        </div>
        <div className={styles.chatInput}>
          <input type="text" placeholder="メッセージを入力" />
          <button>送信</button>
        </div>
      </div>
    </div>
  );
}
