"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FollowList() {
  const [list, setList] = useState<any[]>([]);

  // Hàm lấy data từ LocalStorage
  const loadList = () => {
    const saved = JSON.parse(localStorage.getItem("truyenTheoDoi") || "[]");
    setList(saved);
  };

  useEffect(() => {
    loadList(); // Chạy lần đầu
    // Lắng nghe sự kiện bấm nút theo dõi để tự cập nhật
    window.addEventListener('storageChanged', loadList);
    return () => window.removeEventListener('storageChanged', loadList);
  }, []);

  return (
    <div className="relative group ml-4">
      <button className="text-pink-400 font-bold hover:text-pink-300">
        Đang theo dõi ({list.length})
      </button>
      <div className="absolute hidden group-hover:flex flex-col bg-gray-800 mt-2 p-2 rounded shadow-xl w-64 z-50 right-0">
        {list.length > 0 ? (
          list.map(t => (
            <Link key={t.id} href={`/id-story/${t.id}`} className="py-2 border-b border-gray-700 hover:text-blue-400 transition text-sm">
              {t.tenTruyen}
            </Link>
          ))
        ) : (
          <p className="text-gray-400 p-2 text-sm">Chưa theo dõi truyện nào</p>
        )}
      </div>
    </div>
  );
}