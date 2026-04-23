"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// CHỖ NÀY QUAN TRỌNG: Phải đặt là isFollowedInitial
export default function FollowButton({ truyenId, isFollowedInitial }: { truyenId: number, isFollowedInitial: boolean }) {
  const [isFollowed, setIsFollowed] = useState(isFollowedInitial);
  const router = useRouter();

  const toggleFollow = async () => {
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ truyenId }),
    });

    if (res.ok) {
      setIsFollowed(!isFollowed);
      router.refresh(); 
    } else {
      alert("Vui lòng đăng nhập để thực hiện tính năng này!");
    }
  };

  return (
    <button 
      onClick={toggleFollow}
      className={`px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95 ${
        isFollowed 
        ? "bg-red-600 hover:bg-red-700 text-white" 
        : "bg-green-600 hover:bg-green-700 text-white"
      }`}
    >
      {isFollowed ? "Hủy theo dõi" : "❤️ Theo dõi"}
    </button>
  );
}