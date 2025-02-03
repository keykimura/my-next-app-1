"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ChatBox from "../components/ChatBox";
import YouTube from 'react-youtube';
import styles from './Room.module.css';

interface ChatMessage {
    text: string;
    timestamp: string;
    userId: string;
}

interface YoutubeLink {
    id: string;
    title: string;
    videoId: string;
}

interface Room {
    id: string;
    name: string;
    genre: string;
    maxMembers: number;
    youtubeLinks: YoutubeLink[];
    messages: ChatMessage[];
    createdAt: string;
}

interface RoomUser {
    id: string;
    youtubeLinks: YoutubeLink[];
}

export default function Room() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('id');
    const [room, setRoom] = useState<Room | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [currentVideo, setCurrentVideo] = useState<string | null>(null);
    const [nowPlaying, setNowPlaying] = useState<{title: string; userId: string | null} | null>(null);
    const [youtubeLinks, setYoutubeLinks] = useState<YoutubeLink[]>([]);
    const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [playHistory, setPlayHistory] = useState<{title: string; videoId: string}[]>([]);

    useEffect(() => {
        console.log("WebSocket接続を試行中...");
        const newSocket = io("http://localhost:3001", {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            timeout: 20000,
            forceNew: true
        });
        console.log("Socket.IOクライアントを初期化しました");

        newSocket.on('connect', () => {
            console.log('WebSocket接続成功:', newSocket.id);
            setSocket(newSocket);

            // Pingの送信を開始
            const pingInterval = setInterval(() => {
                newSocket.emit('ping');
            }, 5000);

            // クリーンアップ時にインターバルをクリア
            return () => clearInterval(pingInterval);
        });

        newSocket.on('connect_error', (error) => {
            console.error('WebSocket接続エラー:', error);
            console.log('Pollingトランスポートに切り替えます...');
            newSocket.io.opts.transports = ['polling'];
        });

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (roomId) {
            fetchRoomDetails();
            fetchYoutubeLinks();
        }
    }, [roomId]);

    useEffect(() => {
        if (!socket || !room?.name) return;

        console.log("Setting up socket listeners for room:", room.name);

        socket.removeAllListeners();
        
        socket.emit("joinRoom", room.name, (error: any) => {
            if (error) {
                console.error("Error joining room:", error);
            } else {
                console.log("Successfully joined room:", room.name);
            }
        });

        const handleMessageHistory = (history: ChatMessage[]) => {
            console.log("Received message history:", history);
            if (Array.isArray(history)) {
                setMessages(history);
            }
        };

        const handleNewMessage = (message: ChatMessage) => {
            console.log("Received new message:", message);
            setMessages(prevMessages => {
                // より厳密な重複チェック
                const isDuplicate = prevMessages.some(
                    msg => 
                        msg.timestamp === message.timestamp && 
                        msg.userId === message.userId &&
                        msg.text === message.text
                );
                
                if (isDuplicate) {
                    console.log("Duplicate message detected, skipping...");
                    return prevMessages;
                }
                
                // 新しいメッセージを即時追加（ソートなし）
                return [...prevMessages, message];
            });

            // メッセージ受信確認
            socket?.emit('messageReceived', {
                messageTimestamp: message.timestamp,
                userId: message.userId
            });
        };

        socket.on("messageHistory", handleMessageHistory);
        socket.on("message", handleNewMessage);
        socket.on("error", (error: { message: string }) => {
            console.error("Socket error:", error);
        });
        socket.on("currentVideo", setCurrentVideo);
        socket.on("nowPlaying", (info: {title: string; userId: string | null}) => {
            setNowPlaying(info);
            setPlayHistory(prev => {
                const newEntry = {
                    title: info.title,
                    videoId: currentVideo || ''
                };
                const isExisting = prev.some(entry => 
                    entry.videoId === newEntry.videoId && entry.title === newEntry.title
                );
                if (isExisting || !currentVideo) return prev;
                return [newEntry, ...prev].slice(0, 10);
            });
        });
        socket.on("updateYoutubeLinks", (links: YoutubeLink[]) => {
            setYoutubeLinks(links);
            handleRandomVideo(links);
        });
        socket.on("updateRoomUsers", setRoomUsers);

        socket.on("connect", () => {
            console.log("Socket reconnected");
            if (room?.name) {
            socket.emit("joinRoom", room.name, (error: any) => {
                if (error) {
                    console.error("Error rejoining room:", error);
                } else {
                    console.log("Successfully rejoined room:", room.name);
                }
            });
            }
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        return () => {
            console.log("Cleaning up socket listeners");
            socket.emit("leaveRoom", room.name);
            socket.removeAllListeners();
        };
    }, [room?.name, socket]);

    useEffect(() => {
        if (youtubeLinks.length > 0 && !currentVideo) {
            handleRandomVideo(youtubeLinks);
        }
    }, [youtubeLinks]);

    const fetchYoutubeLinks = async () => {
        try {
            const response = await fetch(`/api/rooms/${roomId}/youtube-links`);
            if (!response.ok) throw new Error('動画リストの取得に失敗しました');
            const data = await response.json();
            setYoutubeLinks(data);
        } catch (error) {
            console.error('Error fetching youtube links:', error);
        }
    };

    const fetchRoomDetails = async () => {
        try {
            const response = await fetch(`/api/rooms/${roomId}`);
            if (!response.ok) throw new Error('ルーム情報の取得に失敗しました');
            const data = await response.json();
            setRoom(data);
        } catch (error) {
            console.error('Error fetching room details:', error);
        }
    };

    const handleRandomVideo = (availableVideos: YoutubeLink[]) => {
        if (!room?.name) return;

        const allVideos = [
            ...availableVideos,
            ...roomUsers.reduce((acc, user) => [...acc, ...user.youtubeLinks], [] as YoutubeLink[])
        ];

        if (allVideos.length > 0) {
            const randomIndex = Math.floor(Math.random() * allVideos.length);
            const randomVideo = allVideos[randomIndex];
            
            setCurrentVideo(randomVideo.videoId);
            setNowPlaying({
                title: randomVideo.title,
                userId: null
            });

            const newHistoryEntry = {
                title: randomVideo.title,
                videoId: randomVideo.videoId
            };
            setPlayHistory(prev => [newHistoryEntry, ...prev].slice(0, 10));

            if (socket) {
                socket.emit("currentVideo", {
                    room: room.name,
                    videoId: randomVideo.videoId,
                    title: randomVideo.title
                });
            }
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!room?.name || !message.trim() || !socket?.id) {
            console.error("Cannot send message: missing required data", {
                room: room?.name,
                message: message.trim(),
                socketId: socket?.id
            });
            return;
        }

        try {
            console.log("Attempting to send message:", message);
            const timestamp = new Date().toISOString();
            
            socket.emit("message", {
                room: room.name,
                text: message.trim(),
                timestamp: timestamp,
                userId: socket.id
            }, (error: any) => {
                if (error) {
                    console.error("Error sending message:", error);
                    return;
                }
                console.log("Message sent successfully");
            });
        } catch (error) {
            console.error("Error in handleSendMessage:", error);
        }
    };

    const opts = {
        height: '390',
        width: '640',
        playerVars: {
            autoplay: 1,
            controls: 1,
            disablekb: 0,
            rel: 0,
            modestbranding: 1,
            fs: 1,
            origin: window.location.origin
        },
    };

    const handleVideoEnd = () => {
        handleRandomVideo(youtubeLinks);
    };

    const handleVideoError = () => {
        console.error('Video playback error');
        handleRandomVideo(youtubeLinks);
    };

    if (!room) return <div>Loading...</div>;

    return (
        <div className={styles.roomPage}>
            <h1 className={styles.roomTitle}>{room.name}</h1>
            <div className={styles.roomInfo}>
                <span className={styles.genre}>ジャンル: {room.genre}</span>
                <Link href={`/youtubeList?roomId=${roomId}`} className={styles.youtubeListLink}>
                    YouTube管理
                </Link>
            </div>
            
            <div className={styles.mainContent}>
                <div className={styles.videoSection}>
                    <h2>放送中 {nowPlaying && `- ${nowPlaying.title}`}</h2>
                    {nowPlaying?.userId && (
                        <p className={styles.contributor}>
                            投稿者: User {nowPlaying.userId.slice(0, 6)}
                        </p>
                    )}
                    <div className={styles.videoContainer}>
                        {currentVideo ? (
                            <div className={styles.videoWrapper}>
                                <YouTube
                                    videoId={currentVideo}
                                    opts={opts}
                                    onEnd={handleVideoEnd}
                                    onError={handleVideoError}
                                    className={styles.youtubePlayer}
                                />
                            </div>
                        ) : (
                            <div className={styles.noVideo}>
                                <p>動画を読み込み中...</p>
                            </div>
                        )}
                    </div>
                    <div className={styles.historyContainer}>
                        <div className={styles.historySection}>
                            <h3>再生履歴</h3>
                            {playHistory.length === 0 ? (
                                <p className={styles.emptyHistory}>再生履歴はありません</p>
                            ) : (
                                <ul className={styles.history}>
                                    {playHistory.map((video, index) => (
                                        <li key={index} className={styles.historyItem}>
                                            <div className={styles.historyVideo}>
                                                <iframe
                                                    width="160"
                                                    height="90"
                                                    src={`https://www.youtube.com/embed/${video.videoId}?origin=${window.location.origin}`}
                                                    title={video.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                />
                                                <a 
                                                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.videoLink}
                                                >
                                                    {video.title}
                                                </a>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className={styles.userList}>
                            <h3>入室中のユーザー</h3>
                            <ul>
                                {roomUsers.map((user) => (
                                    <li key={user.id}>
                                        User {user.id.slice(0, 6)}
                                        {user.youtubeLinks.length > 0 && ` (${user.youtubeLinks.length} videos)`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={styles.chatSection}>
                {socket && (
                    <ChatBox
                        socket={socket}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        currentRoom={roomId}
                        username={`User ${socket?.id?.slice(0, 6) || 'Unknown'}`}
                    />
                )}
                </div>
            </div>
        </div>
    );
}
