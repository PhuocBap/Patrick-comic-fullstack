"use client";

import { useRouter } from "next/navigation";

interface Chapter {
  id: number;
  soChuong: number;
}

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentChapterId: number;
  slug: string;
}

export default function ChapterNavigation({ 
  chapters, 
  currentChapterId,
  slug 
}: ChapterNavigationProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const selectedChapter = chapters.find(c => c.id === selectedId);
    
    if (selectedChapter) {
      // Điều hướng về cấu trúc URL ông muốn
      router.push(`/chapters-story/${slug}/${selectedChapter.soChuong}`);
    }
  };

  return (
    <div className="relative">
      <select 
        value={currentChapterId}
        onChange={handleChange}
        // Thêm cursor-pointer để người dùng biết có thể click
        className="bg-[#2a2a2a] text-white border border-gray-700 rounded px-3 py-1.5 text-xs md:text-sm outline-none focus:border-blue-500 cursor-pointer hover:bg-[#333] transition-colors appearance-none pr-8"
      >
        {chapters.map((chap) => (
          <option key={chap.id} value={chap.id}>
            Chương {chap.soChuong}
          </option>
        ))}
      </select>
      {/* Icon mũi tên xuống nhỏ cho đẹp */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-gray-400">
        ▼
      </div>
    </div>
  );
}