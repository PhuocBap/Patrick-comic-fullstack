"use client";
import { useState, useEffect } from "react";

export default function CommentForm({ truyenId, chuongId }: { truyenId: number, chuongId?: number }) {
  const [noiDung, setNoiDung] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/comments?truyenId=${truyenId}`);
      const result = await res.json();
      if (result.success) setComments(result.data);
    } catch (err) {
      console.error("Không load được bình luận");
    }
  };

  useEffect(() => {
    loadComments();
  }, [truyenId]);

  const handleGuiBinhLuan = async () => {
    if (!noiDung.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          noiDung: noiDung.trim(), 
          truyenId, 
          chuongId: chuongId || null 
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setNoiDung("");
        setComments([result.data, ...comments]);
      } else {
        alert(result.message || "Gửi thất bại");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-inner">
        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
          Bình luận cộng đồng
        </h3>
        <textarea
          className="w-full bg-gray-800 text-gray-200 p-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
          rows={3}
          placeholder="Bạn nghĩ gì về bộ truyện này?..."
          value={noiDung}
          onChange={(e) => setNoiDung(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <button 
            onClick={handleGuiBinhLuan}
            disabled={isSubmitting || !noiDung.trim()}
            className="px-8 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((item) => (
            <div key={item.id} className="bg-gray-800/30 p-4 rounded-lg border border-gray-800 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-blue-400 font-bold text-sm">
                   @{item.nguoiDung?.tenDangNhap || "Thành viên"}
                </span>
                <span className="text-gray-500 text-[10px]">
                  {item.ngayBinhLuan ? new Date(item.ngayBinhLuan).toLocaleDateString() : "Vừa xong"}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{item.noiDung}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-600 italic">
            Chưa có bình luận nào. Hãy khai bát ngay!
          </div>
        )}
      </div>
    </div>
  );
}