"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export default function CommentForm({ truyenId, chuongId }: { truyenId: number, chuongId?: number }) {
  const { data: session } = useSession();
  const [noiDung, setNoiDung] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // 🎯 Thêm state quản lý lỗi trực quan

  // Định cấu hình giới hạn ký tự đồng bộ với Backend DTO
  const MAX_LENGTH = 500;
  const MIN_LENGTH = 3;

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/comments?truyenId=${truyenId}`);
      if (res.ok) {
        const result = await res.json();
        setComments(result.data || result);
      }
    } catch (err) { 
      console.error("Lỗi tải bình luận:", err); 
    }
  }, [truyenId]);

  useEffect(() => { 
    loadComments(); 
  }, [loadComments]);

  const handleGuiBinhLuan = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) {
      setErrorMessage("Vui lòng đăng nhập để thực hiện chức năng này!");
      return;
    }

    const trimmedContent = noiDung.trim();

    // 🛡️ FRONTEND VALIDATION: Chặn ngay lập tức để tiết kiệm request lên server
    if (trimmedContent.length < MIN_LENGTH) {
      setErrorMessage(`Nội dung bình luận quá ngắn (Tối thiểu ${MIN_LENGTH} ký tự).`);
      return;
    }
    if (trimmedContent.length > MAX_LENGTH) {
      setErrorMessage(`Nội dung bình luận vượt quá giới hạn ${MAX_LENGTH} ký tự.`);
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null); // Xóa thông báo lỗi cũ trước khi gửi

    try {
      const response = await fetch(`${backendUrl}/comments`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: String(userId),
          noiDung: trimmedContent, 
          truyenId: Number(truyenId), 
          chuongId: chuongId ? Number(chuongId) : null 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setNoiDung("");
        // Load lại danh sách từ server để đảm bảo thứ tự hiển thị và cache đồng bộ chuẩn xác
        await loadComments();
      } else {
        // 🎯 ĐỌC LỖI TRỰC TIẾP TỪ BACKEND: Nếu lỗi mảng (ValidationPipe), lấy phần tử đầu tiên
        const serverMessage = Array.isArray(result.message) ? result.message[0] : result.message;
        setErrorMessage(serverMessage || "Gửi bình luận thất bại!");
      }
    } catch (error) {
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm lắng nghe sự thay đổi text, tự động xóa thông báo lỗi khi user sửa lại
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoiDung(e.target.value);
    if (errorMessage) setErrorMessage(null);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-[#121212] p-6 rounded-[2rem] border border-gray-800 shadow-xl relative overflow-hidden">
        <h3 className="text-xl font-black mb-4 text-white uppercase tracking-wider flex items-center gap-3">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span> Thảo luận cộng đồng
        </h3>

        {/* 🚨 THÔNG BÁO LỖI UI MƯỢT MÀ (Thay thế alert trình duyệt) */}
        {errorMessage && (
          <div className="mb-4 p-4 text-xs font-bold text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl transition-all">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="relative">
          <textarea
            className={`w-full bg-black/40 text-gray-200 p-5 pb-10 rounded-2xl border outline-none transition-all resize-none text-sm ${
              noiDung.length > MAX_LENGTH ? 'border-red-600 focus:border-red-600' : 'border-gray-800 focus:border-blue-600'
            }`}
            rows={4}
            placeholder={session ? "Bạn nghĩ gì về bộ truyện này? Chia sẻ cảm xúc nhé..." : "Vui lòng đăng nhập để bình luận"}
            value={noiDung}
            onChange={handleTextareaChange}
            disabled={!session}
            maxLength={MAX_LENGTH + 50} // Cho gõ lố một chút để thấy bộ đếm chuyển đỏ
          />

          {/* 📊 BỘ ĐẾM KÝ TỰ REAL-TIME CHUYÊN NGHIỆP */}
          {session && (
            <div className={`absolute bottom-3 right-4 text-[11px] font-black tracking-wider ${
              noiDung.length > MAX_LENGTH ? 'text-red-500' : 'text-gray-500'
            }`}>
              {noiDung.length} / {MAX_LENGTH}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button 
            onClick={handleGuiBinhLuan}
            disabled={isSubmitting || !noiDung.trim() || !session || noiDung.length > MAX_LENGTH}
            className="px-10 py-3 rounded-full font-black text-[12px] uppercase bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-20 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/20"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </div>
      </div>

      {/* DANH SÁCH BÌNH LUẬN */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-xs font-bold uppercase tracking-widest">Chưa có bình luận nào. Hãy là người đầu tiên!</div>
        ) : (
          comments.map((item) => (
            <div key={item.id} className="bg-[#121212]/50 p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-blue-400 font-black text-[12px] uppercase">
                  @{item.nguoiDung?.tenDangNhap || "Thành viên"}
                </span>
                <span className="text-gray-600 text-[10px] font-bold">
                  {item.ngayBinhLuan ? new Date(item.ngayBinhLuan).toLocaleString() : "Vừa xong"}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed pl-4 border-l-2 border-blue-600/30 break-words whitespace-pre-line">
                {item.noiDung}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}