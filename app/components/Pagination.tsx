import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-10">
      <Link
        href={`?page=${Math.max(1, currentPage - 1)}`}
        className={`px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-md transition-all hover:bg-gray-800 ${
          currentPage === 1 ? "opacity-30 pointer-events-none" : "text-gray-300"
        }`}
      >
        Trước
      </Link>

      <div className="flex gap-2">
        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-500">...</span>
          ) : (
            <Link
              key={`page-${p}`}
              href={`?page=${p}`}
              className={`w-10 h-10 flex items-center justify-center rounded-md font-bold transition-all ${
                p === currentPage
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:border-blue-500 hover:text-white"
              }`}
            >
              {p}
            </Link>
          )
        )}
      </div>

      <Link
        href={`?page=${Math.min(totalPages, currentPage + 1)}`}
        className={`px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-md transition-all hover:bg-gray-800 ${
          currentPage === totalPages ? "opacity-30 pointer-events-none" : "text-gray-300"
        }`}
      >
        Sau
      </Link>
    </div>
  );
}