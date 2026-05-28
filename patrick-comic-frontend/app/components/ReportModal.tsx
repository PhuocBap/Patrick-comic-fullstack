"use client";
import { useState } from "react";

interface ReportModalProps {
  chuongId: number;
  onClose: () => void;
}

export default function ReportModal({ chuongId, onClose }: ReportModalProps) {
  const [loaiLoi, setLoaiLoi] = useState("");
  const [moTa, setMoTa] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGuiBaoLoi = async () => {
    // 1. Kiểm tra đầu vào
    if (!loaiLoi.trim()) {
      alert("Vui lòng chọn loại lỗi!");
      return;
    }

    setLoading(true);
    console.log("🚀 Đang gửi báo lỗi cho chương ID:", chuongId);

    try {
      // 2. Gọi API (Đảm bảo URL này khớp với Backend của ông)
      const res = await fetch("http://localhost:3001/api/reports", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({
          loaiLoi: loaiLoi,
          moTa: moTa || "Không có mô tả",
          chuongId: Number(chuongId),
        }),
      });

      // 3. Kiểm tra phản hồi từ Server
      if (res.ok) {
        const data = await res.json();
        console.log("✅ Server phản hồi thành công:", data);
        alert("Cảm ơn ông đã báo lỗi nhé!");
        
        // Reset form và đóng modal
        setLoaiLoi("");
        setMoTa("");
        onClose();
      } else {
        // Trường hợp server trả về lỗi (400, 404, 500...)
        const errorData = await res.json().catch(() => ({}));
        console.error("❌ Lỗi Server trả về:", errorData);
        alert(`Gửi thất bại: ${errorData.message || "Lỗi không xác định"}`);
      }
    } catch (error) {
      // Trường hợp lỗi kết nối (Server chết, lỗi CORS...)
      console.error("💥 Lỗi kết nối API:", error);
      alert("Không kết nối được tới Server! Hãy kiểm tra xem Backend đã chạy chưa hoặc có lỗi CORS không nhé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#2d333b] rounded-lg shadow-2xl overflow-hidden relative border border-gray-700">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl transition-colors"
        >
          ✕
        </button>

        <div className="p-6">
          <h2 className="text-center text-white text-xl font-bold uppercase mb-6 tracking-widest">
            Báo Lỗi Hệ Thống
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-gray-400 text-xs font-semibold uppercase">Loại lỗi</label>
              <select
                value={loaiLoi}
                onChange={(e) => setLoaiLoi(e.target.value)}
                className="w-full bg-white text-black p-2.5 rounded outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn loại lỗi --</option>
                <option value="Ảnh lỗi">Ảnh lỗi, không thấy ảnh</option>
                <option value="Chương bị trùng">Chương bị trùng</option>
                <option value="Chương chưa dịch">Chương chưa dịch</option>
                <option value="Up sai truyện">Up sai truyện</option>
                <option value="Lỗi khác">Lỗi khác</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 text-xs font-semibold uppercase">Mô tả chi tiết</label>
              <textarea
                placeholder="Ví dụ: Ảnh từ trang 5 bị nhòe..."
                value={moTa}
                onChange={(e) => setMoTa(e.target.value)}
                className="w-full bg-white text-black p-3 rounded h-32 resize-none outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleGuiBaoLoi}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-lg">⏳</span> Đang gửi...
                </>
              ) : (
                "Gửi báo cáo"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}