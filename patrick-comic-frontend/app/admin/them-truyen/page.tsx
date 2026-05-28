"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Cấu hình backend url từ file môi trường
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

const generateSlug = (text: string) => {
  return text.toString().toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '').replace(/(\s+)/g, '-')
    .replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};

const generateKhongDau = (text: string) => {
  return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd').toLowerCase().trim();
};

export default function ThemTruyenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Quản lý Tab: 'manual' (thủ công) hoặc 'crawl' (cào hàng loạt)
  const [activeTab, setActiveTab] = useState<'manual' | 'crawl'>('manual');

  // --- STATE CHO TAB THỦ CÔNG ---
  const [tenTruyen, setTenTruyen] = useState('');
  const [tenKhongDau, setTenKhongDau] = useState('');
  const [slug, setSlug] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [trangThai, setTrangThai] = useState('Đang ra'); // Đồng bộ chữ thường có dấu với Backend Prisma

  // --- STATE CHO TAB CÀO TỰ ĐỘNG ---
  const [urlPage, setUrlPage] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  // Tự động sinh slug và tên không dấu khi gõ tên truyện (Chế độ thủ công)
  useEffect(() => {
    setSlug(generateSlug(tenTruyen));
    setTenKhongDau(generateKhongDau(tenTruyen));
  }, [tenTruyen]);

  // Xử lý submit FORM THỦ CÔNG
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenTruyen.trim() || !thumbnail.trim()) {
      alert("Lỗi: Tên truyện và ảnh bìa là bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/stories`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tenTruyen: tenTruyen.trim(),
          tenKhongDau: tenKhongDau,
          slug: slug, 
          thumbnail: thumbnail.trim(), 
          trangThai: trangThai,
          moTa: "Truyện được tạo thủ công từ trang quản trị",
          tacGia: "Đang cập nhật"
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("🎉 Thêm truyện thủ công thành công!");
        router.push('/admin/stories'); 
        router.refresh();
      } else {
        alert(`❌ Lỗi từ Server: ${data?.message || "Không thể thêm truyện"}`);
      }
    } catch (error) { 
      alert("❌ Thất bại: Lỗi kết nối đến server backend!"); 
    } finally { 
      setLoading(false); 
    }
  };

  // Xử lý submit FORM CÀO HÀNG LOẠT TRUYỆN
  const handleCrawlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlPage.trim()) return alert("Vui lòng điền link trang gốc cần cào truyện!");

    setLoading(true);
    setResultMessage("");
    try {
      // Endpoint gọi chính xác đến phương thức crawlMultiStoriesFromPage ở NestJS backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chuong/crawl-bulk-stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlPage: urlPage.trim() }),
      });

      const result = await res.json();

      if (res.ok) {
        setResultMessage(`🎉 ${result.message || "Tiến trình siêu cào hoàn tất!"}`);
        alert("🎉 Hoàn tất tiến trình siêu cào truyện kèm chương hàng loạt!");
        router.push('/admin/stories');
        router.refresh();
      } else {
        alert(`❌ Thất bại: ${result?.message || "Lỗi không xác định khi bóc tách trang"}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi kết nối server backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-10">
      {/* Tích hợp animation mượt mà trực tiếp bằng style tag */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      <div className="max-w-2xl mx-auto bg-[#1a1a1a] p-8 rounded-[1.5rem] border border-gray-800 shadow-2xl">
        
        {/* Tiêu đề chính */}
        <h1 className="text-3xl font-black mb-6 text-blue-500 uppercase tracking-tighter">
          Quản lý thêm truyện
        </h1>

        {/* THANH CHUYỂN TAB */}
        <div className="flex bg-[#0a0a0a] p-1.5 rounded-xl border border-gray-800 mb-8">
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold uppercase rounded-lg transition-all ${
              activeTab === 'manual' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('manual')}
          >
            ✍️ Thêm thủ công
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold uppercase rounded-lg transition-all ${
              activeTab === 'crawl' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('crawl')}
          >
            🚀 Siêu cào tự động
          </button>
        </div>

        {/* ---------------- TAB 1: TẠO THỦ CÔNG ---------------- */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-6 animate-fadeIn">
            <div>
              <label className="block mb-2 text-sm text-gray-400">Tên truyện</label>
              <input 
                type="text"
                className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded focus:border-blue-500 outline-none transition-all" 
                placeholder="Nhập tên truyện..." 
                value={tenTruyen} 
                onChange={(e) => setTenTruyen(e.target.value)} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm text-gray-400">Tên không dấu (Tự động)</label>
                <input className="w-full p-3 bg-[#0a0a0a] border border-gray-800 rounded text-gray-500 font-mono text-sm outline-none cursor-not-allowed" value={tenKhongDau} readOnly />
              </div>
              <div>
                <label className="block mb-2 text-sm text-gray-400">Slug (Tự động)</label>
                <input className="w-full p-3 bg-[#0a0a0a] border border-gray-800 rounded text-gray-500 font-mono text-sm outline-none cursor-not-allowed" value={slug} readOnly />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">URL Ảnh bìa truyện</label>
              <input 
                type="text"
                className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded focus:border-blue-500 outline-none transition-all text-blue-400" 
                placeholder="https://..." 
                value={thumbnail} 
                onChange={(e) => setThumbnail(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">Trạng thái phát hành</label>
              <select 
                className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded text-white outline-none cursor-pointer focus:border-blue-500" 
                value={trangThai} 
                onChange={(e) => setTrangThai(e.target.value)}
              >
                <option value="Đang ra">Đang ra</option>
                <option value="Hoàn thành">Hoàn thành</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-gray-800 disabled:text-gray-600 uppercase tracking-wider"
            >
              {loading ? "Hệ thống đang lưu truyện..." : "Lưu truyện ngay"}
            </button>
          </form>
        )}

        {/* ---------------- TAB 2: CÀO TỰ ĐỘNG HÀNG LOẠT ---------------- */}
        {activeTab === 'crawl' && (
          <form onSubmit={handleCrawlSubmit} className="space-y-6 animate-fadeIn">
            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Nhập link Trang Chủ hoặc link chuyên mục truyện gốc cần quét:
              </label>
              <input
                type="text"
                value={urlPage}
                onChange={(e) => setUrlPage(e.target.value)}
                placeholder="Ví dụ: https://blogtruyenmoi.net hoặc https://blogtruyenmoi.net/danh-sach/truyen-moi"
                className="w-full p-4 bg-[#0a0a0a] border border-gray-700 rounded-xl focus:border-blue-500 outline-none font-medium transition-all text-blue-400 placeholder:text-gray-700"
                required
              />
              <p className="text-xs text-amber-500 font-semibold mt-2 ml-1">
                ⚠️ Lưu ý: Quá trình bóc tách danh mục truyện và tự động cào toàn bộ chương sẽ mất từ vài phút, vui lòng không tắt tab trình duyệt khi đang chạy!
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "ĐANG SĂN TRUYỆN & CÀO CHƯƠNG HÀNG LOẠT..." : "KÍCH HOẠT SIÊU CÀO TOÀN TRANG"}
            </button>

            {resultMessage && (
              <div className="mt-4 bg-blue-950/30 border border-blue-900/50 p-4 rounded-xl text-xs font-mono text-blue-400 break-words">
                {resultMessage}
              </div>
            )}
          </form>
        )}

      </div>
    </main>
  );
}