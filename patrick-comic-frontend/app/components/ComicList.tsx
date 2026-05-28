"use client";
import ComicCard from "./ComicCard";

interface ComicListProps {
  initialComics: any[];
  totalPages?: number;
  currentPage?: number;
}

export default function ComicList({ initialComics }: ComicListProps) {
  const safeComics = initialComics || [];

  return (
    <div className="w-full">
      {safeComics.length > 0 ? (
        // Nâng cấp Grid từ 6 cột lên tối đa 7 hoặc 8 cột trên màn hình siêu lớn (2xl) để tránh card bị quá to
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6  gap-5 md:gap-6">
          {safeComics.map((comic, index) => (
            <div
              key={comic.id || index}
              className="animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out"
              style={{
                animationDelay: `${index * 40}ms`, // Giảm thời gian delay một chút cho cảm giác mượt, không bị lag
                animationFillMode: 'both'
              }}
            >
              <ComicCard comic={comic} />
            </div>
          ))}
        </div>
      ) : (
        // Giao diện trống (Empty State) làm lại sang xịn mịn hơn
        <div className="col-span-full flex flex-col items-center justify-center py-24 bg-[#0d1117] rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 via-transparent to-transparent opacity-30" />
          
          <div className="relative z-10 text-center max-w-sm px-4">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800 text-2xl mb-4 mx-auto animate-bounce duration-1000">
              🔍
            </div>
            <h4 className="text-gray-200 font-bold text-lg tracking-tight">
              Không tìm thấy kết quả phù hợp
            </h4>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              Thử thay đổi từ khóa, xóa bộ lọc hoặc quay lại trang chủ xem có truyện nào hợp gu không nhé ông bạn!
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-5 text-xs font-semibold text-blue-400 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 px-4 py-2 rounded-lg transition-all"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}