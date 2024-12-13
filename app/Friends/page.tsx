import styles from './Friends.module.css';

export default function FriendsPage() {
  const friends = [
    { name: '市松', message: 'こんにちは！', avatar: '/avatars/avatar1.png' },
    { name: 'TOTAL', message: 'どんな曲が好きですか？', avatar: '/avatars/avatar2.png' },
    { name: 'スミス', message: '人にやさしく', avatar: '/avatars/avatar3.png' },
    { name: 'ストレッチ', message: 'こんにちは！', avatar: '/avatars/avatar4.png' },
    { name: '旭', message: 'こんばんは！', avatar: '/avatars/avatar5.png' },
    { name: '☆彡', message: 'おはよう！', avatar: '/avatars/avatar6.png' },
  ];

  return (
    <div className={styles.friendsPage}>
      <h1 className={styles.title}>フレンド一覧</h1>
      <div className={styles.friendList}>
        {friends.map((friend, index) => (
          <div key={index} className={styles.friendItem}>
            <img src={friend.avatar} alt={`${friend.name}のアバター`} className={styles.avatar} />
            <div className={styles.details}>
              <p className={styles.name}>{friend.name}</p>
              <p className={styles.message}>{friend.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
