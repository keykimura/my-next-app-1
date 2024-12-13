// app/layout.tsx
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "@/app/components/Header";
import Profile from "@/app/components/Profile";
import Buttons from "@/app/components/Buttons";

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

