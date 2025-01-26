"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CreateRoom.module.css';

export default function CreateRoomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    maxMembers: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!formData.name || !formData.genre || !formData.maxMembers) {
        setError('全ての項目を入力してください');
        return;
      }

      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('サーバーからの応答が不正です');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'ルームの作成に失敗しました');
      }

      router.push('/searchRoom');
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
          {error && <p className={styles.error}>{error}</p>}
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="ルーム名を入力"
              className={styles.input}
              value={formData.name}
              onChange={handleChange}
              required
            />
            <select 
              name="genre"
              className={styles.select}
              value={formData.genre}
              onChange={handleChange}
              required
            >
              <option value="">ジャンルを選択</option>
              <option value="ポップ">ポップ</option>
              <option value="ロック">ロック</option>
              <option value="ジャズ">ジャズ</option>
              <option value="クラシック">クラシック</option>
              <option value="アニメ">アニメ</option>
              <option value="その他">その他</option>
            </select>
            <select
              name="maxMembers"
              className={styles.select}
              value={formData.maxMembers}
              onChange={handleChange}
              required
            >
              <option value="">人数を選択</option>
              <option value="5">1～5人</option>
              <option value="10">6～10人</option>
              <option value="20">11～20人</option>
              <option value="50">21～50人</option>
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
