"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export default function CommentForm({ truyenId, chuongId }: { truyenId: number, chuongId?: number }) {
  const { data: session } = useSession();
  const [noiDung, setNoiDung] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/comments?truyenId=${truyenId}`);
      if (res.ok) {
        const result = await res.json();
        // Kiểm tra cấu trúc trả về của API bạn (có result.data hay không)
        setComments(result.data || result);
      }
    } catch (err) { console.error("Lỗi tải bình luận:", err); }
  }, [truyenId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleGuiBinhLuan = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return alert("Vui lòng đăng nhập!");
    if (!noiDung.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/comments`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: String(userId),
          noiDung: noiDung.trim(), 
          truyenId: Number(truyenId), 
          chuongId: chuongId ? Number(chuongId) : null 
        }),
      });

      const result = await response.json();

      // SỬA LỖI: Dùng response.ok để chấp nhận cả mã 200 và 201
      if (response.ok) {
        setNoiDung("");
        const newComment = result.data || result;
        setComments((prev) => [newComment, ...prev]);
      } else {
        alert(result.message || "Gửi thất bại!");
      }
    } catch (error) {
      alert("Lỗi kết nối server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-[#121212] p-6 rounded-[2rem] border border-gray-800 shadow-xl">
        <h3 className="text-xl font-black mb-4 text-white uppercase tracking-wider flex items-center gap-3">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span> Thảo luận cộng đồng
        </h3>
        <textarea
          className="w-full bg-black/40 text-gray-200 p-5 rounded-2xl border border-gray-800 outline-none focus:border-blue-600 transition-all resize-none"
          rows={3}
          placeholder={session ? "Bạn nghĩ gì về bộ truyện này?..." : "Vui lòng đăng nhập để bình luận"}
          value={noiDung}
          onChange={(e) => setNoiDung(e.target.value)}
          disabled={!session}
        />
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleGuiBinhLuan}
            disabled={isSubmitting || !noiDung.trim() || !session}
            className="px-10 py-3 rounded-full font-black text-[12px] uppercase bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 transition-all"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((item) => (
          <div key={item.id} className="bg-[#121212]/50 p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="flex justify-between items-center mb-3">
              <span className="text-blue-400 font-black text-[12px] uppercase">@{item.nguoiDung?.tenDangNhap || "Thành viên"}</span>
              <span className="text-gray-600 text-[10px] font-bold">{item.ngayBinhLuan ? new Date(item.ngayBinhLuan).toLocaleString() : "Vừa xong"}</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed pl-4 border-l-2 border-blue-600/30">{item.noiDung}</p>
          </div>
        ))}
      </div>
    </div>
  );
}