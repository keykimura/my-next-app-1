"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './YoutubeList.module.css';
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3001");

interface YoutubeLink {
    id: string;
    title: string;
    videoId: string;
}

export default function YoutubeListPage() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('roomId');
    const [linkInput, setLinkInput] = useState("");
    const [youtubeLinks, setYoutubeLinks] = useState<YoutubeLink[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (roomId) {
            fetchYoutubeLinks();
            socket.emit("joinRoom", roomId);
        }

        socket.on("updateYoutubeLinks", (links: YoutubeLink[]) => {
            setYoutubeLinks(links);
        });

        return () => {
            if (roomId) {
                socket.emit("leaveRoom", roomId);
            }
            socket.disconnect();
        };
    }, [roomId]);

    const fetchYoutubeLinks = async () => {
        try {
            const response = await fetch(`/api/rooms/${roomId}/youtube-links`);
            if (!response.ok) throw new Error('動画リストの取得に失敗しました');
            const data = await response.json();
            setYoutubeLinks(data);
        } catch (error) {
            console.error('Error fetching youtube links:', error);
            setError('動画リストの取得に失敗しました');
        }
    };

    const extractVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleYoutubeLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!roomId) {
            setError("ルームが選択されていません");
            return;
        }

        if (!linkInput.trim()) {
            setError("URLを入力してください");
            return;
        }

        const videoId = extractVideoId(linkInput);
        if (!videoId) {
            setError("有効なYouTube URLを入力してください");
            return;
        }

        try {
            const response = await fetch(`/api/rooms/${roomId}/youtube-links`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoId }),
            });

            if (!response.ok) {
                throw new Error('動画の追加に失敗しました');
            }

            socket.emit("submitYoutubeLink", { room: roomId, link: videoId });
            setLinkInput("");
            await fetchYoutubeLinks();
        } catch (error) {
            console.error('Error adding youtube link:', error);
            setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
        }
    };

    const handleDeleteLink = async (linkId: string) => {
        try {
            const response = await fetch(`/api/rooms/${roomId}/youtube-links?linkId=${linkId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('動画の削除に失敗しました');
            }

            await fetchYoutubeLinks();
        } catch (error) {
            console.error('Error deleting youtube link:', error);
            setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>YouTube再生リスト</h1>
            
            {error && <p className={styles.error}>{error}</p>}
            
            <div className={styles.addSection}>
                <form onSubmit={handleYoutubeLinkSubmit} className={styles.form}>
                    <input
                        type="text"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="YouTubeのURLを入力"
                        className={styles.input}
                    />
                    <button type="submit" className={styles.addButton}>
                        追加
                    </button>
                </form>
            </div>

            <div className={styles.listSection}>
                <h2>追加済みの動画</h2>
                {youtubeLinks.length === 0 ? (
                    <p className={styles.emptyMessage}>動画が追加されていません</p>
                ) : (
                    <ul className={styles.videoList}>
                        {youtubeLinks.map((link) => (
                            <li key={link.id} className={styles.videoItem}>
                                <div className={styles.videoContent}>
                                    <iframe
                                        width="160"
                                        height="90"
                                        src={`https://www.youtube.com/embed/${link.videoId}?origin=${window.location.origin}`}
                                        title={link.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                    <div className={styles.videoInfo}>
                                        <span className={styles.videoTitle}>
                                            {link.title || link.videoId}
                                        </span>
                                        <button 
                                            className={styles.removeButton}
                                            onClick={() => handleDeleteLink(link.id)}
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
