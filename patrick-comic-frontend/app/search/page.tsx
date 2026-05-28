"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ComicCard from "../components/ComicCard"; 
import Header from "../components/Header";
import Footer from "../components/Footer";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/truyen/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Lỗi frontend search page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="flex items-center gap-4 mb-10 bg-[#121212] p-6 rounded-[2rem] border border-gray-800">
        <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
          Kết quả cho: <span className="text-blue-500 italic">"{query}"</span>
        </h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-blue-500">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current mb-4"></div>
          <p className="font-black uppercase tracking-widest animate-pulse">Đang truy xuất dữ liệu...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {results.map((truyen) => (
            <ComicCard key={truyen.id} comic={truyen} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-[#121212] rounded-[2.5rem] border border-dashed border-gray-800 shadow-inner">
          <div className="text-5xl mb-4 opacity-20">🔍</div>
          <p className="text-gray-400 text-xl font-bold uppercase">Không tìm thấy truyện nào!</p>
          <p className="text-gray-500 text-sm mt-2">Hãy thử tìm tên khác hoặc gõ không dấu xem sao.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Header />
      <div className="flex-grow">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <SearchResults />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}