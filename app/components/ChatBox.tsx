"use client";
import { useEffect } from "react";
import { useState } from "react";
import { Socket } from "socket.io-client";
import styles from './ChatBox.module.css';



interface ChatBoxProps {
    socket : Socket;
    //onLeaveRoom: () => void;
  }
  
  export default function ChatBox({ socket}: ChatBoxProps) {
    
    const [messages, setMessages] = useState<string[]>([]);
    const [message, setMessage] = useState("");
  
    useEffect(() => {
        socket.on("message", (msg: string) => {
            setMessages((prev) => [...prev, msg]);
        });
    }, [socket]);
  
    const sendMessage = () => {
        socket.emit("message", {  message });
        setMessages((prev) => [...prev, `自分: ${message}`]);
        setMessage("");
    };

    return(
    <div className={styles.chatSection}>
        <h2>チャット</h2>
        <div className={styles.chatBox}>
          {messages.map((msg, i) => (
            <div key={i} className={styles.message}>
              {msg}
            </div>
          ))}
        </div>
        <div className={styles.chatInput}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            ></input>
          <button onClick={sendMessage}>送信</button>
          {//<button onClick={onLeaveRoom}>退出</button>
          }
        </div>
        </div>
    )
        }