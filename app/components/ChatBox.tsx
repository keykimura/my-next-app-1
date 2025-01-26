import { Socket } from 'socket.io-client';
import { useState, useRef, useEffect } from 'react';
import styles from './ChatBox.module.css';

interface Message {
    text: string;
    timestamp: string;
    userId: string;
    username?: string;
}

interface ChatBoxProps {
    socket: Socket;
    messages: Message[];
    onSendMessage: (message: string) => void;
    currentRoom: string | null;
    username: string;
}

export default function ChatBox({ 
    socket, 
    messages, 
    onSendMessage, 
    currentRoom,
    username 
}: ChatBoxProps) {
    const [messageInput, setMessageInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageInput.trim()) {
            onSendMessage(messageInput);
            setMessageInput("");
            setIsTyping(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
        
        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing", { room: currentRoom, username });
        }

        // タイピング状態のリセット
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit("stopTyping", { room: currentRoom, username });
        }, 1000);
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                    <div className={styles.noMessages}>
                        メッセージはまだありません
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isSentByMe = msg.userId === socket.id;
                        return (
                            <div
                                key={`${msg.userId}-${msg.timestamp}-${index}`}
                                className={`${styles.messageWrapper} ${
                                    isSentByMe ? styles.sent : styles.received
                                }`}
                            >
                                <div className={styles.messageContent}>
                                    <span className={styles.username}>
                                        {isSentByMe ? 'あなた' : msg.username || `ユーザー${msg.userId.slice(0, 4)}`}
                                    </span>
                                    <div className={`${styles.messageBubble} ${
                                        isSentByMe ? styles.sentBubble : styles.receivedBubble
                                    }`}>
                                        {msg.text}
                                    </div>
                                    <span className={styles.timestamp}>
                                        {formatTimestamp(msg.timestamp)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className={styles.inputForm}>
                <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder="メッセージを入力..."
                    className={styles.messageInput}
                    maxLength={500}
                />
                <button 
                    type="submit" 
                    disabled={!messageInput.trim()}
                    className={styles.sendButton}
                >
                    送信
                </button>
            </form>
        </div>
    );
}
