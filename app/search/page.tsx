"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ComicCard from "../components/ComicCard"; 
import Header from "../components/Header";

// 1. Định nghĩa Interface chuẩn
interface Truyen {
  id: number;
  tenTruyen: string;
  tenKhongDau: string;
  anhBia: string;
  tacGia: string;
  theLoais?: any[];
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  // 2. Sửa lỗi 'never[]' bằng cách gán kiểu <Truyen[]>
  const [results, setResults] = useState<Truyen[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          // Kiểm tra chắc chắn là mảng trước khi set
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Lỗi frontend search:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="flex items-center gap-3 mb-8 border-l-4 border-blue-600 pl-4">
        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
          Kết quả cho: <span className="text-blue-500 italic">"{query}"</span>
        </h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400 font-bold animate-pulse uppercase">Đang truy xuất dữ liệu...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((truyen) => (
            <ComicCard key={truyen.id} comic={truyen} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-[#1e293b]/50 rounded-[2rem] border border-dashed border-gray-700 shadow-2xl">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-400 text-xl font-bold uppercase">Không tìm thấy truyện nào!</p>
          <p className="text-gray-500 text-sm mt-2">Thử tìm với từ khóa khác hoặc tên không dấu nhé.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <Suspense fallback={<div className="text-center py-20 text-white">Đang tải...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}