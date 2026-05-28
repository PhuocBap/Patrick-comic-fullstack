"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Truyen {
  id: number;
  tenTruyen: string;
  thumbnail: string | null;
  luotXem: number;
}

export default function TopViewsHorizontal() {
  const [stories, setStories] = useState<Truyen[]>([]);

  useEffect(() => {
    const fetchTopStories = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; 
        if (!backendUrl) return;

        // CẬP NHẬT: Đổi '/truyen' thành '/stories' để khớp với Controller NestJS
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stories/top-viewed?limit=6`);
        
        if (res.ok) {
          const data = await res.json();
          // Backend trả về mảng trực tiếp cho endpoint top-viewed
          setStories(Array.isArray(data) ? data : []); 
        }
      } catch (error) {
        console.error("Lỗi fetch TopViews:", error);
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

      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story : any) => (
            <Link 
              key={story.id} 
              href={`/${story.slug}/${story.id}`}
              className="flex gap-4 p-4 bg-black/40 rounded-2xl hover:bg-blue-600/10 border border-gray-800 hover:border-blue-500/50 transition-all group"
            >
              <div className="w-20 h-28 flex-shrink-0 overflow-hidden rounded-xl shadow-lg bg-[#222]">
                <img
                  src={story.thumbnail || "/no-image.jpg"}
                  alt={story.tenTruyen}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  // Thêm onError để handle nếu link ảnh die
                  onError={(e) => { (e.target as HTMLImageElement).src = "/no-image.jpg"; }}
                />
              </div>
              <div className="flex flex-col justify-center overflow-hidden">
                <h3 className="font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {story.tenTruyen}
                </h3>
                <p className="text-[11px] text-gray-500 mt-2 font-black uppercase tracking-widest">
                  👁 {(story.luotXem || 0).toLocaleString()} lượt xem
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600 italic">
          Đang cập nhật danh sách xem nhiều...
        </div>
      )}
    </div>
  );
}