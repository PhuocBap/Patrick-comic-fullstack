"use client";

import Link from "next/link";

export default function ComicCard({ comic }: { comic: any }) {
  const renderStatus = () => {
    switch (comic.trangThai) {
      case "HOAN_THANH": return { text: "Full", class: "bg-green-600" };
      case "DANG_RA": return { text: "Đang ra", class: "bg-blue-600" };
      case "TAM_NGUNG": return { text: "Tạm ngưng", class: "bg-red-600" };
      default: return { text: comic.trangThai || "Đang ra", class: "bg-gray-600" };
    }
  };

  const status = renderStatus();

  return (
    <Link 
      href={`/id-story/${comic.id}`} 
      className="group bg-[#161b22] rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all duration-300 shadow-lg hover:-translate-y-1 flex flex-col h-full"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
        <img
          src={comic.thumbnail || "/no-image.jpg"} 
          alt={comic.tenTruyen}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
           <span className={`text-[10px] font-black text-white px-2 py-1 rounded-md uppercase shadow-lg ${status.class}`}>
             {status.text}
           </span>
           {/* THÊM: Badge hiển thị chương đang đọc dở nếu có */}
           {comic.readingChapter && (
             <span className="bg-yellow-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-md shadow-lg">
               Đang đọc C. {comic.readingChapter}
             </span>
           )}
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-sm line-clamp-2 text-gray-100 group-hover:text-blue-400 transition-colors leading-5 min-h-[40px]">
          {comic.tenTruyen}
        </h3>
        
        {/* THÊM: Hiển thị text chương đang đọc dưới tên truyện */}
        {comic.readingChapter && (
          <p className="text-[11px] text-yellow-500 font-medium mb-2">
            Đọc tiếp: Chương {comic.readingChapter}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-800/50">
          <p className="text-[11px] text-gray-500 truncate max-w-[60%] italic">
            {comic.tacGia || "Đang cập nhật"}
          </p>
          
          <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-black/40 px-2 py-0.5 rounded-full border border-gray-800">
            <span className="text-blue-500">👁</span>
            {new Intl.NumberFormat('vi-VN').format(comic.luotXem || 0)}
          </span>
        </div>
      </div>
    </Link>
  );
}