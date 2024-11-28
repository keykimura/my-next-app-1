// app/page.tsx

import Header from "./components/Header";
import Profile from "./components/Profile";
import Buttons from "./components/Buttons";
import styles from "./page.module.css";
import Sidebar from "@/app/components/Sidebar";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    
      <div className={styles.mainContent}>
        <Header />
        <Profile />
        <Buttons />
        <Footer />
      </div>
   
  );
}
