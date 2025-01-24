"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import ChatBox from "../components/ChatBox";
import YouTube from 'react-youtube';
import styles from './Room.module.css';

const socket: Socket = io("http://localhost:3001");

interface ChatMessage {
    text: string;
    timestamp: string;
    userId: string;
}

export default function Home() {
    const [rooms, setRooms] = useState<string[]>([]);
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const [currentVideo, setCurrentVideo] = useState<string | null>(null);
    const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
    const [linkInput, setLinkInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState("");

    useEffect(() => {
        socket.on("updateRoomList", (roomList: string[]) => setRooms(roomList));
        socket.on("currentVideo", (videoId: string) => setCurrentVideo(videoId));
        socket.on("updateYoutubeLinks", (links: string[]) => setYoutubeLinks(links));
        socket.on("message", (message: ChatMessage) => {
            setMessages(prev => [...prev, message]);
        });

        // 初期ルームに参加
        const defaultRoom = "default";
        socket.emit("joinRoom", defaultRoom);
        setCurrentRoom(defaultRoom);

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleYoutubeLinkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentRoom && linkInput) {
            const videoId = extractVideoId(linkInput);
            if (videoId) {
                socket.emit("submitYoutubeLink", { room: currentRoom, link: videoId });
                setLinkInput("");
            }
        }
    };

    const extractVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleNextVideo = () => {
        if (currentRoom) {
            socket.emit("nextVideo", currentRoom);
        }
    };

    const handleSendMessage = (message: string) => {
        if (currentRoom && message.trim()) {
            socket.emit("message", {
                room: currentRoom,
                message: message.trim(),
                userId: socket.id
            });
            setMessageInput("");
        }
    };

    const opts = {
        height: '390',
        width: '640',
        playerVars: {
            autoplay: 1,
        },
    };

    return (
        <div className={styles.roomPage}>
            <h1 className={styles.roomTitle}>ロックを聴く部屋</h1>
            <div className={styles.nowPlaying}>
                <h2>放送中</h2>
                <div className={styles.videoContainer}>
                    {currentVideo && (
                        <YouTube
                            videoId={currentVideo}
                            opts={opts}
                            onEnd={handleNextVideo}
                        />
                    )}
                </div>
                <div className={styles.linkSubmitForm}>
                    <form onSubmit={handleYoutubeLinkSubmit}>
                        <input
                            type="text"
                            value={linkInput}
                            onChange={(e) => setLinkInput(e.target.value)}
                            placeholder="YouTubeのURLを入力"
                            className={styles.linkInput}
                        />
                        <button type="submit" className={styles.submitButton}>
                            追加
                        </button>
                    </form>
                    <button onClick={handleNextVideo} className={styles.nextButton}>
                        次の曲
                    </button>
                </div>
            </div>
            
            <ChatBox
                socket={socket}
                messages={messages}
                onSendMessage={handleSendMessage}
                currentRoom={currentRoom}
            />
        </div>
    );
}
