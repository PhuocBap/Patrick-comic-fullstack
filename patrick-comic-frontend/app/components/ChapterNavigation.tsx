"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface Chapter {
  id: number;
  soChuong: number;
}

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentSoChuong: number; 
  slug: string;
  truyenId: number;
}

export default function ChapterNavigation({ 
  chapters, 
  currentSoChuong,
  slug,
  truyenId
}: ChapterNavigationProps) {
  const router = useRouter();

  // Sắp xếp và lọc trùng danh sách chương từ DB
  const sortedChapters = useMemo(() => {
    const uniqueChapters = Array.from(new Map(chapters.map(item => [item.soChuong, item])).values());
    return uniqueChapters.sort((a, b) => a.soChuong - b.soChuong);
  }, [chapters]);

  // Điều hướng thuần túy, không tích hợp gọi API cào ngầm
  const navigateToChapter = (targetSoChuong: number) => {
    const hasChapter = sortedChapters.some(c => c.soChuong === targetSoChuong);
    if (hasChapter) {
      router.push(`/chapters-story/${slug}/${targetSoChuong}`);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Number(e.target.value);
    if (selected) {
      navigateToChapter(selected);
    }
  };

  const currentIdx = sortedChapters.findIndex(c => c.soChuong === currentSoChuong);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx !== -1 && currentIdx < sortedChapters.length - 1;

  return (
    <div className="flex items-center gap-1.5 bg-[#1a1a1a] p-1 rounded-sm border border-gray-800">
      {/* NÚT MŨI TÊN TRÁI ◀ */}
      <button
        disabled={!hasPrev}
        onClick={() => navigateToChapter(sortedChapters[currentIdx - 1].soChuong)}
        className="px-3 py-2 bg-[#222] text-white text-xs font-bold rounded-sm hover:bg-[#282828] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        ◀
      </button>

      {/* THANH SELECT CHỌN CHƯƠNG THUẦN TÚY */}
      <div className="relative group min-w-[130px]">
        <select
          value={currentSoChuong} 
          onChange={handleSelectChange}
          className="appearance-none w-full bg-[#222] text-white pl-3 pr-8 py-2 rounded-sm text-sm font-bold border border-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-[#282828] transition-all"
        >
          {sortedChapters.map((chapter) => (
            <option key={`nav-item-${chapter.id}-${chapter.soChuong}`} value={chapter.soChuong}>
              Chương {chapter.soChuong}
            </option>
          ))}
        </select>
        
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[9px]">
          ▼
        </div>
      </div>

      {/* NÚT MŨI TÊN PHẢI ▶ */}
      <button
        disabled={!hasNext}
        onClick={() => navigateToChapter(sortedChapters[currentIdx + 1].soChuong)}
        className="px-3 py-2 bg-[#222] text-white text-xs font-bold rounded-sm hover:bg-[#282828] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        ▶
      </button>
    </div>
  );
}