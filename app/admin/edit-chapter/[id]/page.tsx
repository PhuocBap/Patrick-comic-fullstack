"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function EditChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    tenChuong: "",
    soChuong: "",
    noiDung: "", // Link ảnh
  });

  // Lấy dữ liệu chương cũ
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await fetch(`/api/chapters-detail/${id}`); // Ông cần tạo thêm API này hoặc fetch trực tiếp
        if (res.ok) {
          const data = await res.json();
          setFormData({
            tenChuong: data.tenChuong || "",
            soChuong: data.soChuong.toString(),
            noiDung: data.noiDung || "",
          });
        }
      } catch (error) {
        console.error("Lỗi fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/chapters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Cập nhật thành công!");
        router.back(); // Quay lại trang trước
      } else {
        alert("Có lỗi xảy ra khi lưu.");
      }
    } catch (error) {
      alert("Lỗi kết nối server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] text-white p-10">Đang tải dữ liệu chương...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Header />
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <h1 className="text-3xl font-black mb-8 text-blue-400 uppercase tracking-tighter">Sửa chương</h1>
        
        <form onSubmit={handleSubmit} className="bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Số chương</label>
              <input 
                type="number" 
                value={formData.soChuong}
                onChange={(e) => setFormData({...formData, soChuong: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Tên chương (Tùy chọn)</label>
              <input 
                type="text" 
                value={formData.tenChuong}
                onChange={(e) => setFormData({...formData, tenChuong: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                placeholder="Ví dụ: Lời nguyền bóng đêm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
              Danh sách Link ảnh (Mỗi link một dòng)
            </label>
            <textarea 
              rows={15}
              value={formData.noiDung}
              onChange={(e) => setFormData({...formData, noiDung: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all font-mono text-sm"
              placeholder="Dán link ảnh vào đây..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95"
            >
              {saving ? "ĐANG LƯU..." : "CẬP NHẬT CHƯƠNG"}
            </button>
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-8 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold rounded-2xl transition-all"
            >
              HỦY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}