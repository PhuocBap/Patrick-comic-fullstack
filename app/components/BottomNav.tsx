'use client';

import Link from "next/link";
import ChapterNavigation from "./ChapterNavigation";

interface BottomNavProps {
  chapters: { id: number; soChuong: number }[];
  currentChapterId: number;
  prevChapterSo?: number; 
  nextChapterSo?: number; 
  truyenId: number;
  slug: string; 
}

export default function BottomNav({ 
  chapters, 
  currentChapterId, 
  prevChapterSo, 
  nextChapterSo, 
  slug 
}: BottomNavProps) {

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/95 backdrop-blur-md border-t border-gray-800 px-2 py-3 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between text-[11px] md:text-sm font-medium text-white">
        
        {/* Bên trái: Home & Reload */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex flex-col items-center gap-1 hover:text-blue-400 transition-colors">
            <span className="text-lg">🏠</span>
            <span className="hidden xs:inline">Trang Chủ</span>
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="flex flex-col items-center gap-1 hover:text-blue-400 transition-colors"
          >
            <span className="text-lg">⚙️</span>
            <span>Server</span>
          </button>
        </div>

        {/* Giữa: Điều hướng chương */}
        <div className="flex items-center gap-2">
          {prevChapterSo !== undefined ? (
            <Link 
              href={`/chapters-story/${slug}/${prevChapterSo}`} 
              className="bg-[#2a2a2a] p-2 rounded-full hover:bg-blue-600 transition-all active:scale-90"
            >
              ◀
            </Link>
          ) : (
            <button className="bg-[#2a2a2a] p-2 rounded-full opacity-20 cursor-not-allowed">◀</button>
          )}

          <ChapterNavigation 
            chapters={chapters} 
            currentChapterId={currentChapterId} 
            slug={slug} 
          />

          {nextChapterSo !== undefined ? (
            <Link 
              href={`/chapters-story/${slug}/${nextChapterSo}`} 
              className="bg-[#2a2a2a] p-2 rounded-full hover:bg-blue-600 transition-all active:scale-90"
            >
              ▶
            </Link>
          ) : (
            <button className="bg-[#2a2a2a] p-2 rounded-full opacity-20 cursor-not-allowed">▶</button>
          )}
        </div>

        {/* Bên phải: Utilities */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => alert("Cảm ơn ông đã báo lỗi nhé!")} 
            className="flex flex-col items-center gap-1 hover:text-red-400 transition-colors"
          >
            <span className="text-lg">⚠️</span>
            <span>Báo Lỗi</span>
          </button>
          <button 
            onClick={() => alert("Đã thêm vào danh sách theo dõi!")} 
            className="flex flex-col items-center gap-1 hover:text-yellow-400 transition-colors"
          >
            <span className="text-lg">🔖</span>
            <span>Theo Dõi</span>
          </button>
        </div>
      </div>
    </div>
  );
}