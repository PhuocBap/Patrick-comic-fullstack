"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

function removeVietnameseTones(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().trim();
}

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allTheLoais, setAllTheLoais] = useState<any[]>([]);
  // Đã sửa: Chuyển hẳn về kiểu string[] để đồng bộ với ID gốc của bảng Thể Loại
  const [selectedTheLoais, setSelectedTheLoais] = useState<string[]>([]);
  const [formData, setFormData] = useState({ tenTruyen: "", tacGia: "", moTa: "", thumbnail: "", trangThai: "Đang ra" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genresRes, storyRes] = await Promise.all([
          fetch(`${backendUrl}/the-loai`),
          fetch(`${backendUrl}/stories/${id}`)
        ]);
        if (genresRes.ok) setAllTheLoais(await genresRes.json());
        if (storyRes.ok) {
          const data = await storyRes.json();
          setFormData({
            tenTruyen: data.tenTruyen || "",
            tacGia: data.tacGia || "",
            moTa: data.moTa || "",
            thumbnail: data.thumbnail || "",
            trangThai: data.trangThai || "Đang ra",
          });
          
          if (data.theLoais) {
            // Đã sửa: Lưu ID dạng chuỗi nguyên bản từ DB
            const ids = data.theLoais.map((tl: any) => tl.id.toString());
            setSelectedTheLoais(ids);
          }
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          tenKhongDau: removeVietnameseTones(formData.tenTruyen),
          theLoaiIds: selectedTheLoais
        }),
      });
      
      if (res.ok) {
        const updatedStory = await res.json(); // Nhận data truyện đã cập nhật từ backend trả về
        alert("Cập nhật thành công!");
        
        // Chuyển hướng theo đúng cấu trúc folder [slug]/[id] của bạn
        router.push(`/${updatedStory.slug}/${id}`); 
        router.refresh();
      } else {
        alert("Cập nhật thất bại!");
      }
    } catch (error) { 
      alert("Lỗi kết nối!"); 
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-blue-500 font-bold animate-pulse">ĐANG TẢI...</div>;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-[#111] p-8 rounded-[2rem] border border-gray-800 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Chỉnh sửa truyện <span className="text-blue-500">#{id}</span></h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tên bộ truyện</label>
              <input className="w-full bg-black p-4 rounded-xl border border-gray-800 focus:border-blue-600 outline-none transition-all" value={formData.tenTruyen} onChange={(e) => setFormData({...formData, tenTruyen: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tác giả</label>
              <input className="w-full bg-black p-4 rounded-xl border border-gray-800 focus:border-blue-600 outline-none transition-all" value={formData.tacGia} onChange={(e) => setFormData({...formData, tacGia: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Link ảnh bìa</label>
              <input className="w-full bg-black p-4 rounded-xl border border-gray-800 focus:border-blue-600 outline-none transition-all font-mono text-xs text-blue-400" value={formData.thumbnail} onChange={(e) => setFormData({...formData, thumbnail: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Trạng thái</label>
              <select 
                className="w-full bg-black p-4 rounded-xl border border-gray-800 focus:border-blue-600 outline-none transition-all text-sm text-gray-300 cursor-pointer h-[54px]"
                value={formData.trangThai} 
                onChange={(e) => setFormData({...formData, trangThai: e.target.value})}
              >
                <option value="Đang ra" className="bg-[#111] text-white">Đang ra</option>
                <option value="Hoàn thành" className="bg-[#111] text-white">Hoàn thành</option>
                <option value="Tạm ngưng" className="bg-[#111] text-white">Tạm ngưng</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mô tả</label>
            <textarea className="w-full bg-black p-4 rounded-xl border border-gray-800 h-32 focus:border-blue-600 outline-none transition-all resize-none text-sm text-gray-400" value={formData.moTa} onChange={(e) => setFormData({...formData, moTa: e.target.value})} />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Thể loại ({selectedTheLoais.length})</label>
            <div className="flex flex-wrap gap-2 p-4 bg-black rounded-xl border border-gray-800">
              {allTheLoais?.map(tl => {
                const targetId = tl.id.toString();
                const isChecked = selectedTheLoais.includes(targetId);
                return (
                  <button 
                    key={tl.id} 
                    type="button" 
                    onClick={() => {
                      setSelectedTheLoais(prev => isChecked ? prev.filter(i => i !== targetId) : [...prev, targetId]);
                    }}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all ${isChecked ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'}`}
                  >
                    {tl.ten.toUpperCase()} 
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] p-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-200 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 border border-blue-400/20"
          >
            <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Lưu Thay Đổi</span>
          </button>
        </form>
      </div>
    </main>
  );
}