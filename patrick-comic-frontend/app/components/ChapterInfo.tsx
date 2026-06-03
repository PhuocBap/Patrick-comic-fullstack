"use client";
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import ChapterNavigation from "./ChapterNavigation";

interface ChapterInfoProps {
  comicName: string;
  chapterNumber: number;
  updatedAt: string; 
  prevSlug?: string;
  nextSlug?: string;
  truyenId: number;
  slug: string;
  allChapters: { id: number; soChuong: number }[];
  currentChapterId: number;
}

function getRelativeTime(dateString: string): string {
  if (!dateString) return "vừa xong";
  const now = new Date();
  const updated = new Date(dateString);
  if (isNaN(updated.getTime())) return "vừa xong";
  const diffInSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000);
  if (diffInSeconds < 60) return "vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return updated.toLocaleDateString('vi-VN');
}

export default function ChapterInfo({ 
  comicName, 
  chapterNumber, 
  updatedAt, 
  truyenId,
  slug,
  allChapters,
}: ChapterInfoProps) { 
  const [timeDisplay, setTimeDisplay] = useState<string>("vừa xong");

  useEffect(() => {
    setTimeDisplay(getRelativeTime(updatedAt));
  }, [updatedAt]);

  // Sắp xếp chương tăng dần để tính toán nút Trước / Sau chính xác
  const sortedChapters = useMemo(() => {
    const uniqueChapters = Array.from(new Map(allChapters.map(item => [item.soChuong, item])).values());
    return uniqueChapters.sort((a, b) => a.soChuong - b.soChuong);
  }, [allChapters]);

  // Tìm chương trước và chương sau dựa trên số chương hiện tại
  const prevChapterNumber = useMemo(() => {
    const currentIdx = sortedChapters.findIndex(c => c.soChuong === chapterNumber);
    if (currentIdx > 0) return sortedChapters[currentIdx - 1].soChuong;
    return null;
  }, [sortedChapters, chapterNumber]);

  const nextChapterNumber = useMemo(() => {
    const currentIdx = sortedChapters.findIndex(c => c.soChuong === chapterNumber);
    if (currentIdx !== -1 && currentIdx < sortedChapters.length - 1) {
      return sortedChapters[currentIdx + 1].soChuong;
    }
    return null;
  }, [sortedChapters, chapterNumber]);

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <nav className="text-sm text-gray-400 mb-4 flex flex-wrap gap-2 items-center">
        <Link href="/" className="hover:text-blue-500 transition-colors">Trang Chủ</Link>
        <span className="opacity-50">/</span>
        <Link href={`/${slug}/${truyenId}`} className="hover:text-blue-500 transition-colors">{comicName}</Link>
        <span className="opacity-50">/</span>
        <span className="text-gray-500 italic">Chương {chapterNumber}</span>
      </nav>

      <div className="bg-[#161616] border border-gray-800 rounded-sm p-4 md:p-6 shadow-xl text-center">
        <h1 className="text-lg md:text-2xl font-bold text-white mb-4 border-b border-gray-800 pb-4 leading-tight">
          {comicName} - Chapter {chapterNumber} 
          <span className="text-xs md:text-sm font-normal text-gray-500 ml-2 italic underline decoration-gray-700">
            (Cập nhật lúc: {timeDisplay})
          </span>
        </h1>

        <div className="text-center space-y-3 mb-6 bg-[#0f0f0f] py-4 rounded-md border border-gray-900">
          <p className="text-xs md:text-sm text-gray-400">
            Nếu không xem được truyện vui lòng đổi <strong className="text-gray-200">"SERVER HÌNH"</strong> bên dưới
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-1.5 rounded-sm text-xs font-bold uppercase transition-all active:scale-95 shadow-lg shadow-green-900/20">
            Server 1
          </button>
        </div>

        <div className="bg-[#d1ecf1] text-[#0c5460] py-2.5 text-center rounded-sm text-[11px] md:text-xs mb-6 font-medium border border-[#bee5eb]/30 px-2">
          Mẹo: Sử dụng mũi tên trái (←) hoặc phải (→) để chuyển chapter nhanh
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3">
          {/* NÚT CHAP TRƯỚC: Chỉ hoạt động nếu chương trước ĐÃ CÓ sẵn trong DB */}
          <Link 
            href={prevChapterNumber ? `/chapters-story/${slug}/${prevChapterNumber}` : "#"} 
            className={`px-4 py-2 rounded-sm text-xs md:text-sm font-bold transition flex items-center gap-1 ${
              prevChapterNumber ? 'bg-[#e9ecef] text-gray-800 hover:bg-gray-300 active:scale-95' : 'bg-gray-800 text-gray-600 pointer-events-none opacity-50'
            }`}
          >
            ← Chap Trước
          </Link>
          
          <ChapterNavigation 
            chapters={allChapters} 
            currentSoChuong={chapterNumber} 
            slug={slug} 
            truyenId={truyenId} 
          />

          {/* NÚT CHAP SAU: Chỉ chuyển hướng nếu chương sau ĐÃ CÓ sẵn trong DB */}
          <Link 
            href={nextChapterNumber ? `/chapters-story/${slug}/${nextChapterNumber}` : "#"} 
            className={`px-4 py-2 rounded-sm text-xs md:text-sm font-bold transition flex items-center gap-1 shadow-lg shadow-blue-900/20 ${
              nextChapterNumber ? 'bg-[#33a2ff] text-white hover:bg-[#2d8edb] active:scale-95' : 'bg-gray-800 text-gray-600 pointer-events-none opacity-50'
            }`}
          >
            Chap Sau →
          </Link>
        </div>
      </div>
    </div>
  );
}