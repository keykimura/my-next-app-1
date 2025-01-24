import { Socket } from 'socket.io-client';
import { useState } from 'react';
import styles from './ChatBox.module.css';

interface ChatMessage {
    text: string;
    timestamp: string;
    userId: string;
}

interface ChatBoxProps {
    socket: Socket;
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    currentRoom: string | null;
}

export default function ChatBox({ socket, messages, onSendMessage, currentRoom }: ChatBoxProps) {
    const [messageInput, setMessageInput] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageInput.trim()) {
            onSendMessage(messageInput);
            setMessageInput("");
        }
    };

    return (
        <div className={styles.chatSection}>
            <div className={styles.chatMessages}>
                {messages.map((msg, index) => (
                    <div key={index} className={styles.message}>
                        <span className={styles.time}>{msg.timestamp}</span>
                        <div className={`${styles.bubble} ${
                            msg.userId === socket.id ? styles.blue : styles.gray
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className={styles.chatInput}>
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="メッセージを入力"
                />
                <button type="submit">送信</button>
            </form>
        </div>
    );
}
