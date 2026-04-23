"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ITruyen {
  id: number;
  tenTruyen: string;
  thumbnail: string | null;
  luotXem: number;
}

export default function TopViewsHorizontal() {
  const [stories, setStories] = useState<ITruyen[]>([]);

  useEffect(() => {
    const fetchTopStories = async () => {
      try {
        const res = await fetch("/api/top-stories");
        if (res.ok) {
          const data = await res.json();
          // Lấy tối đa 6 hoặc 9 truyện để chia hết cho 3
          setStories(data.slice(0, 6)); 
        }
      } catch (error) {
        console.error("Lỗi fetch:", error);
      }
    };
    fetchTopStories();
  }, []);

  return (
    <div className="mt-16 bg-[#111] p-8 rounded-[2.5rem] border border-gray-800/50">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-2xl">🔥</span>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">
          Truyện Xem Nhiều Nhất
        </h2>
      </div>

      {/* Grid: 1 cột trên mobile, 3 cột trên desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <Link 
            key={story.id} 
            href={`/id-story/${story.id}`}
            className="flex gap-4 p-4 bg-black/40 rounded-2xl hover:bg-blue-600/10 border border-gray-800 hover:border-blue-500/50 transition-all group"
          >
            <div className="w-20 h-28 flex-shrink-0 overflow-hidden rounded-xl shadow-lg">
              <img
                src={story.thumbnail || "/no-image.jpg"}
                alt={story.tenTruyen}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>
            <div className="flex flex-col justify-center overflow-hidden">
              <h3 className="font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                {story.tenTruyen}
              </h3>
              <p className="text-[11px] text-gray-500 mt-2 font-black uppercase tracking-widest">
                👁 {story.luotXem.toLocaleString()} lượt xem
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}