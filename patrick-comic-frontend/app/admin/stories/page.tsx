"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; 

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stories?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setStories(data.data || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  const deleteStory = async (id: number) => {
    if (!confirm("Xóa là mất hết chương, chắc chưa ông?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (stories.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          setStories(prev => prev.filter(s => s.id !== id));
        }
      }
    } catch (error) { alert("Lỗi xóa!"); }
  };

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-tighter">Quản lý truyện ({page}/{totalPages})</h1>
        <Link href="/admin/them-truyen" className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-all">
          + THÊM TRUYỆN
        </Link>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="p-10 text-white italic text-center">Đang tải dữ liệu...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#1a1a1a] text-gray-400 text-[10px] uppercase">
              <tr>
                <th className="p-4">Truyện (Click để quản lý)</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((s: any) => (
                <tr key={s.id} className="border-t border-gray-800 hover:bg-[#151515] transition-colors group">
                  <td className="p-4">
                    {/* Bọc toàn bộ ô thông tin bằng Link để nhảy sang trang chi tiết */}
                    <Link href={`/id-story/${s.id}`} className="flex items-center gap-3 group/item">
                      <div className="relative overflow-hidden rounded shadow-md">
                        <img src={s.thumbnail} className="w-10 h-14 object-cover bg-black group-hover/item:scale-110 transition-transform duration-300" alt="" />
                      </div>
                      <span className="font-bold group-hover/item:text-blue-400 transition-colors">{s.tenTruyen}</span>
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded uppercase font-bold border border-blue-500/20">
                      {s.trangThai}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {/* Thêm một nút Quản lý nhỏ cho rõ ràng về mặt UX */}
                    <Link href={`/id-story/${s.id}`} className="text-blue-400 text-[10px] font-bold border border-blue-400/20 px-2 py-1.5 rounded hover:bg-blue-400 hover:text-white transition-all">
                      QUẢN LÝ
                    </Link>
                    <button onClick={() => deleteStory(s.id)} className="text-red-500 text-[10px] font-bold border border-red-500/20 px-2 py-1.5 rounded hover:bg-red-500 hover:text-white transition-all">
                      XÓA
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
      <div className="flex justify-center items-center mt-8 gap-4">
        <button 
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-xs font-bold disabled:opacity-30 hover:border-blue-500 transition-all"
        >
          TRANG TRƯỚC
        </button>
        
        <div className="flex gap-2">
           {[...Array(totalPages)].map((_, i) => (
             <button
               key={i}
               onClick={() => setPage(i + 1)}
               className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:border-gray-600'}`}
             >
               {i + 1}
             </button>
           ))}
        </div>

        <button 
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-xs font-bold disabled:opacity-30 hover:border-blue-500 transition-all"
        >
          TRANG TIẾP
        </button>
      </div>
    </div>
  );
}