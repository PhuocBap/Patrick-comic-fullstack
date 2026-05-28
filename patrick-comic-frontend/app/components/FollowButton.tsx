"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export default function FollowButton({ truyenId, isFollowedInitial }: { truyenId: number, isFollowedInitial: boolean }) {
  const { data: session } = useSession();
  const [isFollowed, setIsFollowed] = useState(isFollowedInitial);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Đồng bộ lại trạng thái nếu props từ Server thay đổi
  useEffect(() => {
    setIsFollowed(isFollowedInitial);
  }, [isFollowedInitial]);

  const toggleFollow = async () => {
    const userId = (session?.user as any)?.id;

    if (!userId) {
      alert("Vui lòng đăng nhập để thực hiện tính năng này!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, truyenId: Number(truyenId) }),
      });

      if (res.ok) {
        const result = await res.json();
        setIsFollowed(result.followed); // Cập nhật dựa trên kết quả trả về từ NestJS
        router.refresh(); // Làm mới các Server Component khác (như FollowList)
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Lỗi thao tác!");
      }
    } catch (error) {
      alert("Lỗi kết nối server!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleFollow}
      disabled={isLoading}
      className={`px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95 ${
        isFollowed 
        ? "bg-red-600 hover:bg-red-700 text-white" 
        : "bg-green-600 hover:bg-green-700 text-white"
      } ${isLoading ? "opacity-50" : ""}`}
    >
      {isLoading ? "..." : isFollowed ? "Hủy theo dõi" : "❤️ Theo dõi"}
    </button>
  );
}