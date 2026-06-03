"use client";
import { useRouter } from "next/navigation";

export default function ComicCard({ comic }: { comic: any }) {
  const router = useRouter();
  const data = comic.truyen ? comic.truyen : comic;

  const statusMap: any = {
    "HOAN_THANH": { text: "Full", class: "bg-emerald-500 shadow-emerald-500/20" },
    "DANG_RA": { text: "Đang ra", class: "bg-blue-500 shadow-blue-500/20" },
    "TAM_NGUNG": { text: "Tạm ngưng", class: "bg-rose-500 shadow-rose-500/20" }
  };
  const status = statusMap[data.trangThai] || statusMap["DANG_RA"];

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    // Tăng lượt xem (PATCH)
    fetch(`${apiUrl}/stories/${data.id}/view`, {
      method: 'PATCH',
      keepalive: true,
    }).catch((err) => console.error("Lỗi tăng view:", err));

    // 🔥 SỬA TẠI ĐÂY: Điều hướng sang cấu trúc URL mới /slug/id
    // Đề phòng trường hợp data.slug bị rỗng (null/undefined), ta sẽ fallback về một chuỗi tạm hoặc chính ID
    const storySlug = data.slug || "story";
    router.push(`/${storySlug}/${data.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-[#0d1117] rounded-xl overflow-hidden border border-gray-800/80 hover:border-blue-500/80 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 flex flex-col h-full relative cursor-pointer select-none"
    >
      {/* Khối Ảnh Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
        <img
  src={data.thumbnail?.replace(/src=http:\/\//g, 'src=https://')} // Tự động ép link con thành https
  alt={data.tenTruyen}
  referrerPolicy="no-referrer"
  loading="lazy"
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
/>
        
        {/* Lớp phủ Gradient khi hover để nổi bật nội dung */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300" />

        {/* Tag trạng thái thiết kế lại mềm mại hơn */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className={`${status.class} text-[10px] font-bold text-white px-2.5 py-0.5 rounded-md shadow-lg backdrop-blur-sm bg-opacity-90 uppercase tracking-wider`}>
            {status.text}
          </span>
        </div>

        {/* Nút "Đọc Ngay" ẩn hiện khi hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 hover:bg-blue-500 transition-colors">
            Đọc ngay ➜
          </span>
        </div>
      </div>

      {/* Khối Thông Tin */}
      <div className="p-3.5 flex flex-col flex-grow">
        <h3 className="font-semibold text-sm line-clamp-2 text-gray-200 group-hover:text-blue-400 mb-2.5 leading-snug transition-colors duration-200 min-h-[40px]">
          {data.tenTruyen}
        </h3>
        
        {/* Badge Chương Mới Nhất */}
        <div className="mt-auto">
          <span className="inline-block bg-blue-950/40 text-blue-400 text-[11px] font-medium px-2 py-0.5 rounded-md border border-blue-900/30">
            {data.chuongMoiNhat ? `Chương ${data.chuongMoiNhat}` : "Chưa có chương"}
          </span>
        </div>

        {/* Footer của Card */}
        <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-gray-800/60 text-[11px] text-gray-400">
          <span className="truncate max-w-[65%] hover:text-gray-200 transition-colors" title={data.tacGia}>
            {data.tacGia || "Ẩn danh"}
          </span>
          <span className="flex items-center gap-1 font-medium text-gray-500">
            👁 {new Intl.NumberFormat().format(data.luotXem || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}