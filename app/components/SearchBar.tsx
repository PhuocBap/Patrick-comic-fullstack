"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = query.trim();
      if (trimmed.length >= 1) {
        setLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
          const data = await res.json();
          // Bảo vệ map() bằng Array.isArray
          setResults(Array.isArray(data) ? data : []);
          setShowDropdown(true);
        } catch (error) {
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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
    const trimmedQuery = query.trim().replace(/\s+/g, ' ');
    if (trimmedQuery.length >= 1) { 
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
        <input
          type="text"
          placeholder="Tìm tên truyện hoặc tác giả..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          className="w-full bg-gray-700 text-white text-xs md:text-sm px-3 py-1.5 rounded-l-md focus:outline-none border border-gray-600 focus:border-blue-500 transition-all"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-[7px] md:py-[8.5px] rounded-r-md transition-colors flex items-center justify-center border border-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 w-full bg-[#1a1a1a] border border-gray-700 mt-1 rounded shadow-2xl z-[9999] max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-xs text-gray-400">Đang tìm...</div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  router.push(`/id-story/${item.id}`);
                  setShowDropdown(false);
                }}
                className="flex gap-3 p-2 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0"
              >
                <img 
                  src={item.thumbnail || "/no-image.png"} 
                  referrerPolicy="no-referrer" // Fix lỗi chặn ảnh nguồn ngoài
                  className="w-10 h-14 object-cover rounded shadow-sm bg-gray-800" 
                  alt={item.tenTruyen}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/no-image.png"; }}
                />
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-white text-sm font-medium truncate">{item.tenTruyen}</span>
                  <span className="text-gray-400 text-xs truncate">{item.tacGia || "Đang cập nhật"}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-xs text-gray-500 italic text-center">Không tìm thấy truyện</div>
          )}
        </div>
      )}
    </div>
  );
}