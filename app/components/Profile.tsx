// components/Profile.tsx
import styles from "./Profile.module.css";

const Profile: React.FC = () => {
  return (
    <div className={styles.profile}>
      <img
        src="/profile.jpg"  // publicディレクトリの画像を使用
        alt="Profile"
        className={styles.profileImage}
      />
      <p><strong>名前:</strong> カザンオールスターズ</p>
      <p>
        <strong>自己紹介:</strong>
        <br />
        こんにちは！私は洋楽が好きな専門学生です！仲良くしてください！
      </p>
    </div>
  );
};

export default Profile;
