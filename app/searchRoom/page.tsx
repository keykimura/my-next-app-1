import styles from './Search.module.css';

export default function RoomsPage() {
  const rooms = [
    { name: 'アイドルソング', count: '0/50' },
    { name: '最近のロックを聴く部屋', count: '8/50' },
    { name: '90年代のアニソン', count: '15/50' },
    { name: 'オアシス', count: '23/50' },
  ];

  return (
    <div className={styles.searchPage}>
      <header className={styles.header}>
        <h1>🎵 ルーム探索</h1>
        <div className={styles.searchBar}>
          <input type="text" placeholder="検索" className={styles.searchInput} />
          <button className={styles.genreButton}>ジャンル検索 ▼</button>
          <button className={styles.addButton}>＋</button>
        </div>
      </header>
      <ul className={styles.roomList}>
        {rooms.map((room, index) => (
          <li key={index} className={styles.roomItem}>
            <span className={styles.roomName}>{room.name}</span>
            <span className={styles.roomCount}>{room.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
