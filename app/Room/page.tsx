"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import ChatBox from "../components/ChatBox";

const socket: Socket = io("http://localhost:3001");

import styles from './Room.module.css';

export default function Home() {

  const [rooms, setRooms] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  useEffect(() => {
    // サーバーからルームリストを取得


    socket.on("updateRoomList", (roomList: string[]) => setRooms(roomList));
    return () => {
        socket.disconnect();
    };
}, []);

  useEffect(() => {
      socket.on("updateRoomList", (roomList: string[]) => setRooms(roomList));
      return () => {
          socket.disconnect();
      };
  }, []);

  return (
    
    <div className={styles.roomPage}>
      <h1 className={styles.roomTitle}>ロックを聴く部屋</h1>
      <div className={styles.nowPlaying}>
        <h2>放送中</h2>
        <div className={styles.trackInfo}>
          <p>曲名とか</p>
          <button className={styles.historyButton}>履歴</button>
        </div>
      </div>
      
      <ChatBox
          socket={socket}
          //onLeaveRoom={() => {
              //socket.emit("leaveRoom", currentRoom);
              //setCurrentRoom(null);
          
      />
        
      </div>
    
  );
}
