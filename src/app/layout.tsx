import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "เช็คลิสต์ห้องเรียนของเรา",
  description: "เช็คลิสต์การบ้าน ชุดที่ต้องใส่ และอุปกรณ์การเรียนของทั้งห้อง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <head>
        {/* 폰트는 브라우저가 런타임에 불러옴 (빌드 타임 fetch 아님) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@600;700;800&family=Noto+Sans+Thai:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
