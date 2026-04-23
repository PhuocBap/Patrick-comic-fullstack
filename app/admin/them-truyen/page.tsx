'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const generateKhongDau = (text: string) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
};

export default function ThemTruyenPage() {
  const [ten, setTen] = useState('');
  const [tenKhongDau, setTenKhongDau] = useState('');
  const [slug, setSlug] = useState('');
  const [thumbnail, setThumbnail] = useState(''); // Đã đổi tên thành thumbnail cho khớp DB
  const [trangThai, setTrangThai] = useState('DANG_RA');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setSlug(generateSlug(ten));
    setTenKhongDau(generateKhongDau(ten));
  }, [ten]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/truyen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Gửi dữ liệu với tên biến khớp hoàn toàn với Backend bóc tách
        body: JSON.stringify({ 
          ten, 
          tenKhongDauManual: tenKhongDau, 
          slug, 
          thumbnail, 
          trangThai 
        }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) {
        alert("Thêm truyện thành công!");
        router.push('/'); 
        router.refresh();
      } else {
        alert("Lỗi: " + (data?.message || "Không thể thêm truyện"));
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      alert("Đã xảy ra lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-10 font-sans">
      <div className="max-w-2xl mx-auto bg-[#1a1a1a] p-8 rounded-lg border border-gray-800">
        <h1 className="text-3xl font-bold mb-8 text-blue-500 uppercase tracking-wider">
          Thêm Truyện Mới
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Tên truyện</label>
            <input
              type="text"
              className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded focus:border-blue-500 outline-none"
              placeholder="Nhập tên truyện..."
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-400">Tên không dấu (Tìm kiếm)</label>
            <input
              type="text"
              className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded outline-none text-gray-500 italic"
              value={tenKhongDau}
              readOnly
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-400">Slug (URL)</label>
            <input
              type="text"
              className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded outline-none text-gray-500 italic"
              value={slug}
              readOnly
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Link URL Ảnh bìa</label>
            <input
              type="url"
              className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded focus:border-blue-500 outline-none"
              placeholder="https://img.otruyenapi.com/..."
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Trạng thái</label>
            <select
              className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded focus:border-blue-500 outline-none"
              value={trangThai}
              onChange={(e) => setTrangThai(e.target.value)}
            >
              <option value="DANG_RA">Đang ra</option>
              <option value="HOAN_THANH">Hoàn thành</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "LƯU TRUYỆN"}
          </button>
        </form>
      </div>
    </main>
  );
}