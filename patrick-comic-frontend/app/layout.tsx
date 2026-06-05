import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./components/NextAuthProvider"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PATRICK COMIC - Đọc truyện online",
  description: "Web đọc truyện tranh đỉnh cao",
  icons: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUTExMVFhUXGRgZFxgXFxUYGBobGhgbGRkYGBgYHSggGBolGxgYIjEhJSkrLi4uHSAzODMsNygtLisBCgoKDg0OGxAQGy8lHyUvLi81LS0tLS0tLS8tLSstLS0tLS0uLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAQ4AugMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAAAwQFBgcCAQj/xABKEAACAQIDBAYFCAgEBQQDAAABAgMAEQQSIQUxQVEGEyJhcYEHMpGhsRQXQlJyksHRIzNigqKy4fAWNOLISJFNzk/EVQ1WzVGOU/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAIDBAEF/8QAKhEAAgIBAwMEAgEFAAAAAAAAAAECEQMSITETMkEEIlFxxbGBFCMzkfD/2gAMAwEAAhEDEQA/ANG+cDBc5PuH86PnAwXOT7h/Osnorf8A00DL1pGsfOBgucn3D+dHzgYLnJ9w/nVK2PsGKbByTNKkTrLkDSuEjtlU2OnrXY0n/hyP/wCQwH/fH5VN48KdNjqWR7pF5+cDBc5PuH86PnAwXOT7h/Oql0A2JBiXmEyFggQrZmXeWv6?... (chuỗi base64 giữ nguyên)"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ scrollBehavior: 'smooth' }}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-gray-100">
        <NextAuthProvider>
          <main className="flex-grow">
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  );
}