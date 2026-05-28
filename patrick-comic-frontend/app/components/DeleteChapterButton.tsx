"use client";
import { useState } from "react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function DeleteChapterButton({ chapterId }: { chapterId: number }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Sử dụng xác nhận mạnh mẽ hơn để tránh bấm nhầm
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn chương này (ID: ${chapterId})?`)) {
      setIsDeleting(true);
      try {
        // CẬP NHẬT: Sử dụng backendUrl và đúng endpoint /chuong/
        const res = await fetch(`${backendUrl}/chuong/${chapterId}`, { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (res.ok) {
          alert("✅ Đã xóa chương thành công!");
          // Tải lại trang để cập nhật danh sách chương
          window.location.reload();
        } else {
          const errorData = await res.json().catch(() => ({}));
          alert(`❌ Lỗi khi xóa: ${errorData.message || "Server từ chối yêu cầu"}`);
        }
      } catch (error) {
        console.error("Lỗi xóa chương:", error);
        alert("❌ Lỗi kết nối đến máy chủ!");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`p-2 rounded-lg transition-all text-[10px] font-black uppercase flex items-center gap-1
        ${isDeleting 
          ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
          : "bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white shadow-lg shadow-red-900/10 active:scale-90"
        }`}
    >
      {isDeleting ? (
        <>
          <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          ĐANG XÓA
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          XÓA
        </>
      )}
    </button>
  );
}