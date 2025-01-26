"use client";
import { useEffect, useState } from 'react';
import styles from './Search.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Room {
  id: string;
  name: string;
  genre: string;
  maxMembers: number;
}

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (!response.ok) throw new Error('ルームの取得に失敗しました');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || room.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = ['ポップ', 'ロック', 'ジャズ', 'クラシック', 'アニメ', 'その他'];

  return (
    <div className={styles.searchPage}>
      <header className={styles.header}>
        <h1>🎵 ルーム探索</h1>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="検索"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.genreSelect}
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">全てのジャンル</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          <Link href="/createRoom">
            <button className={styles.addButton}>＋</button>
          </Link>
        </div>
      </header>
      <ul className={styles.roomList}>
        {filteredRooms.map((room) => (
          <li key={room.id} className={styles.roomItem}>
            <Link href={`/Room?id=${room.id}`}>
              <button className={styles.roomName}>
                {room.name}
                <span className={styles.roomGenre}>{room.genre}</span>
              </button>
            </Link>
            <span className={styles.roomCount}>0/{room.maxMembers}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
