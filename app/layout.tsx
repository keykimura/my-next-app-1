// app/layout.tsx
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Header from "@/components/Header";
import Profile from "@/components/Profile";
import Buttons from "@/components/Buttons";

export const metadata = {
  title: "Home",
  description: "A sample Next.js app with a sidebar layout",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}
      <main >
      <Sidebar />
      </main>
      </body>
    </html>
  );
}

