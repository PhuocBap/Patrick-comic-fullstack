"use client";
import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: Props) {
  // Kiểm tra an toàn để tránh NaN nếu props bị truyền thiếu hoặc sai kiểu dữ liệu
  const current = Number(currentPage) || 1;
  const total = Number(totalPages) || 1;

  if (total <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showMax = 5;

    if (total <= showMax) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (current > 3) pages.push("...");

      // Tính toán start/end an toàn
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (current < total - 2) pages.push("...");
      if (!pages.includes(total)) pages.push(total);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-10">
      {/* Nút Trước */}
      <Link
        href={`?page=${Math.max(1, current - 1)}`}
        className={`px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-md transition-all hover:bg-gray-800 ${
          current === 1 ? "opacity-30 pointer-events-none" : "text-gray-300"
        }`}
      >
        Trước
      </Link>

      {/* Danh sách số trang */}
      <div className="flex gap-2">
        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-500 self-center">...</span>
          ) : (
            <Link
              key={`page-${p}`}
              href={`?page=${p}`}
              className={`w-10 h-10 flex items-center justify-center rounded-md font-bold transition-all ${
                Number(p) === current
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:border-blue-500 hover:text-white"
              }`}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {/* Nút Sau */}
      <Link
        href={`?page=${Math.min(total, current + 1)}`}
        className={`px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-md transition-all hover:bg-gray-800 ${
          current === total ? "opacity-30 pointer-events-none" : "text-gray-300"
        }`}
      >
        Sau
      </Link>
    </div>
  );
}