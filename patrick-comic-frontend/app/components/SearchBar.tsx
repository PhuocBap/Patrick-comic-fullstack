"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(false); 
  
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = query.trim();
      if (trimmed.length >= 1) {
        setLoading(true);
        setError(false);
        try {
          // Gọi endpoint /stories/search
          const res = await fetch(`${backendUrl}/stories/search?query=${encodeURIComponent(trimmed)}`);
          
          if (!res.ok) {
             // Nếu server trả về lỗi (như lỗi 500 trong image_48d1d6.jpg)
             throw new Error(`Server Error: ${res.status}`);
          }

          const data = await res.json();
          // Đảm bảo kết quả là một mảng
          const finalData = Array.isArray(data) ? data : (data.data || []);
          setResults(finalData);
          setShowDropdown(true);
        } catch (error) {
          console.error("Lỗi search dropdown:", error);
          setResults([]);
          setError(true); 
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 400); 

    return () => clearTimeout(timer);
  }, [query, backendUrl]);

  // Xử lý đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery.length >= 1) { 
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full group" ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
        <input
          type="text"
          placeholder="Tìm tên truyện, tác giả..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          className={`w-full bg-[#0d1117] text-white text-sm px-4 py-2.5 rounded-xl border transition-all duration-300 placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 ${
            error ? 'border-red-500/50 focus:border-red-500' : 'border-gray-800 focus:border-blue-600/50'
          }`}
        />
        <button type="submit" className="absolute right-2 p-1.5 text-gray-500 hover:text-blue-500 transition-colors">
          {loading ? (
            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {showDropdown && (
        <div className="absolute top-[110%] left-0 w-full bg-[#161b22]/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
          <div className="p-2 border-b border-gray-800/50 flex justify-between items-center bg-[#1c2128]">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Kết quả tìm kiếm</span>
             {error && <span className="text-[9px] text-red-400 font-bold px-2 animate-pulse">LỖI HỆ THỐNG (500)</span>}
          </div>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {results.length > 0 ? (
              results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    router.push(`/id-story/${item.id}`);
                    setShowDropdown(false);
                    setQuery("");
                  }}
                  className="group/item flex gap-4 p-3 hover:bg-blue-600/10 cursor-pointer transition-all border-b border-gray-800/30 last:border-0"
                >
                  <img 
                    src={item.thumbnail} 
                    className="w-10 h-14 object-cover rounded-md shadow-lg bg-gray-900 flex-shrink-0" 
                    alt={item.tenTruyen}
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/no-image.png"; }}
                  />
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <h4 className="text-white text-[13px] font-bold truncate group-hover/item:text-blue-400 transition-colors">
                      {item.tenTruyen}
                    </h4>
                    <p className="text-gray-500 text-[11px] truncate mt-0.5">{item.tacGia || "Đang cập nhật"}</p>
                  </div>
                </div>
              ))
            ) : !loading && (
              <div className="p-8 text-center text-gray-500 text-sm italic">
                {error ? "Backend đang gặp sự cố, vui lòng thử lại sau." : "Không tìm thấy truyện nào khớp với từ khóa."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}