"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

function removeVietnameseTones(str: string) {
  if (!str) return "";
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allTheLoais, setAllTheLoais] = useState<any[]>([]);
  const [selectedTheLoais, setSelectedTheLoais] = useState<string[]>([]);
  const [formData, setFormData] = useState({ 
    tenTruyen: "", 
    tacGia: "", 
    moTa: "", 
    thumbnail: "", 
    trangThai: "ĐANG_RA" 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genresRes, storyRes] = await Promise.all([
          fetch(`/api/the-loai`),
          fetch(`/api/truyen/${id}`) 
        ]);

        if (genresRes.ok) setAllTheLoais(await genresRes.json());
        
        if (storyRes.ok) {
          const data = await storyRes.json();
          // Kiểm tra xem data có tồn tại không trước khi set
          if (data) {
            setFormData({
              tenTruyen: data.tenTruyen || "",
              tacGia: data.tacGia || "",
              moTa: data.moTa || "",
              thumbnail: data.thumbnail || "", // Đảm bảo đúng tên trường thumbnail
              trangThai: data.trangThai || "ĐANG_RA",
            });
            
            // Map theLoais từ mảng Object sang mảng ID
            if (data.theLoais) {
              setSelectedTheLoais(data.theLoais.map((tl: any) => tl.id));
            }
          }
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/truyenadd/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...formData, 
        tenKhongDau: removeVietnameseTones(formData.tenTruyen),
        theLoaiIds: selectedTheLoais 
      }),
    });

    if (res.ok) {
      alert("Cập nhật thành công!");
      router.refresh();
      router.push(`/id-story/${id}`);
    } else {
      const err = await res.json();
      alert("Lỗi: " + err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-bold">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Header />
      <div className="container mx-auto py-10 px-4 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-[#1e293b] p-8 rounded-3xl space-y-5 border border-gray-700 shadow-2xl">
          <h1 className="text-2xl font-black text-blue-500 uppercase italic">Chỉnh sửa truyện #{id}</h1>
          
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Tên truyện</label>
            <input 
              className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-all" 
              value={formData.tenTruyen} 
              onChange={(e) => setFormData({...formData, tenTruyen: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Link ảnh bìa</label>
            <input 
              className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-all font-mono text-sm" 
              value={formData.thumbnail} 
              onChange={(e) => setFormData({...formData, thumbnail: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Tác giả</label>
              <input 
                className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" 
                value={formData.tacGia} 
                onChange={(e) => setFormData({...formData, tacGia: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Trạng thái</label>
              <select 
                className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" 
                value={formData.trangThai} 
                onChange={(e) => setFormData({...formData, trangThai: e.target.value})}
              >
                <option value="ĐANG_RA">Đang ra</option>
                <option value="HOAN_THANH">Hoàn thành</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Mô tả</label>
            <textarea 
              className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none h-32 resize-none" 
              value={formData.moTa} 
              onChange={(e) => setFormData({...formData, moTa: e.target.value})} 
            />
          </div>

          <div>
             <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Thể loại</label>
             <div className="flex flex-wrap gap-2 p-3 bg-gray-900 rounded-xl border border-gray-700">
                {allTheLoais.map(tl => {
                  const isActive = selectedTheLoais.includes(tl.id);
                  return (
                    <button 
                      key={tl.id} 
                      type="button" 
                      onClick={() => setSelectedTheLoais(prev => isActive ? prev.filter(i => i !== tl.id) : [...prev, tl.id])}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${isActive ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-transparent text-gray-500 hover:bg-gray-700'}`}>
                      {tl.ten.toUpperCase()}
                    </button>
                  )
                })}
             </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 p-4 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 uppercase tracking-widest">
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
}