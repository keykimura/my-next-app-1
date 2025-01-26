// app/layout.tsx
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Providers from "./providers";
import { auth } from "@/auth";

export const metadata = {
  title: "Home",
  description: "A sample Next.js app with a sidebar layout",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="ja">
      <body>
        <Providers session={session}>
          <div className="layout-container">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
