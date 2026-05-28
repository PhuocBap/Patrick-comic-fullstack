"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface SaveHistoryProps {
  truyenId: any;
  chuongId: any;
}

export default function SaveHistory({ truyenId, chuongId }: SaveHistoryProps) {
  const { data: session, status } = useSession();
  const lastSaved = useRef<string>("");

  useEffect(() => {
    // 1. Chỉ thực hiện khi đã đăng nhập thành công
    if (status !== "authenticated" || !session?.user) return;

    const userId = (session.user as any).id;
    const currentKey = `${truyenId}-${chuongId}`;

    // 2. Kiểm tra dữ liệu và tránh gửi trùng lặp
    if (!userId || !truyenId || !chuongId || lastSaved.current === currentKey) return;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/history/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId, 
            truyenId: Number(truyenId),
            chuongId: Number(chuongId),
          }),
        });

        if (response.ok) {
          lastSaved.current = currentKey;
          console.log("✅ PATRICCOMIC: Đã cập nhật lịch sử cho chương", chuongId);
        } else {
          const errorData = await response.json();
          console.error("❌ PATRICCOMIC: Backend từ chối lưu:", errorData.message);
        }
      } catch (error) {
        console.error("❌ PATRICCOMIC: Lỗi kết nối khi lưu lịch sử:", error);
      }
    }, 2000); 

    return () => clearTimeout(timer);
  }, [session, status, truyenId, chuongId]);

  return null;
}