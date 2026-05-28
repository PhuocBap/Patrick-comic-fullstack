"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function EditChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ tenChuong: "", soChuong: "", noiDung: "" });

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await fetch(`${backendUrl}/chuong/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({ 
            tenChuong: data.tenChuong || "", 
            soChuong: data.soChuong.toString(), 
            noiDung: data.noiDung || "" 
          });
        }
      } catch (error) { 
        console.error("Lỗi tải chương:", error);
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
      const res = await fetch(`${backendUrl}/chuong/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tenChuong: formData.tenChuong,
          soChuong: Number(formData.soChuong),
          noiDung: formData.noiDung 
        }),
      });

      if (res.ok) { 
        alert("✅ Đã cập nhật thành công vào Database!"); 
        router.refresh(); // Làm mới dữ liệu
        router.back(); 
      } else {
        const errorData = await res.json();
        alert(`❌ Lỗi từ Server: ${errorData.message || "Không thể lưu"}`);
      }
    } catch (error) { 
      alert("❌ Lỗi kết nối đến Backend!"); 
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-blue-500 font-bold animate-pulse">
      ĐANG TẢI DỮ LIỆU...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
            <h1 className="text-2xl font-black uppercase">Sửa nội dung chương</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] p-8 rounded-[2rem] border border-gray-800 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Số chương</label>
              <input 
                type="number" 
                value={formData.soChuong} 
                onChange={(e) => setFormData({...formData, soChuong: e.target.value})} 
                className="w-full bg-black p-4 rounded-xl border border-gray-800 focus:border-blue-600 outline-none font-bold" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Tên chương (tùy chọn)</label>
              <input 
                type="text" 
                value={formData.tenChuong} 
                onChange={(e) => setFormData({...formData, tenChuong: e.target.value})} 
                className="w-full bg-black p-4 rounded-xl border border-gray-800 focus:border-blue-600 outline-none font-bold" 
                placeholder="Tên tập phim/truyện..." 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Nội dung ảnh (Link mỗi dòng 1 ảnh)</label>
            <textarea 
              rows={15} 
              value={formData.noiDung} 
              onChange={(e) => setFormData({...formData, noiDung: e.target.value})} 
              className="w-full bg-black p-6 rounded-2xl border border-gray-800 focus:border-blue-600 outline-none font-mono text-sm text-blue-300 leading-relaxed" 
              required 
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={saving} 
              className="flex-[2] bg-blue-600 hover:bg-blue-700 py-5 rounded-xl font-black uppercase transition-all disabled:opacity-50 tracking-widest shadow-lg shadow-blue-900/20"
            >
              {saving ? "ĐANG LƯU..." : "XÁC NHẬN CẬP NHẬT"}
            </button>
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="flex-1 bg-gray-900 hover:bg-gray-800 py-5 rounded-xl font-black uppercase border border-gray-800 transition-all"
            >
              HỦY BỎ
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}