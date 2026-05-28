"use client";
import { useEffect, useState } from "react";
import Link from "next/link"; // Thêm import Link để điều hướng

export default function AdminDashboard() {
  const [stats, setStats] = useState({ stories: 0, users: 0, reports: 0, comments: 0 });
  const [latestStories, setLatestStories] = useState<any[]>([]);
  const [allTheLoais, setAllTheLoais] = useState<any[]>([]); 
  const [newGenre, setNewGenre] = useState(""); 
  const [loading, setLoading] = useState(true);

  const fetchGenres = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/the-loai`)
      .then(res => res.json())
      .then(data => setAllTheLoais(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stories?limit=5`)
      .then(res => res.json())
      .then(data => {
        setLatestStories(data.data || []);
        setLoading(false);
      });

    fetchGenres();
  }, []);

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenre.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/the-loai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ten: newGenre.trim() }),
      });

      if (res.ok) {
        setNewGenre("");
        fetchGenres(); 
      } else {
        alert("Lỗi khi thêm thể loại!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGenre = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thể loại này không?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/the-loai/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchGenres(); 
      } else {
        alert("Không thể xóa thể loại này!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // CẬP NHẬT: Thêm thuộc tính href cho từng card tương ứng với sidebar
  const cards = [
    { label: "Tổng truyện", val: stats.stories, icon: "📚", color: "from-blue-600 to-blue-400", shadow: "shadow-blue-500/10", href: "/admin/stories" },
    { label: "Người dùng", val: stats.users, icon: "👥", color: "from-emerald-600 to-teal-400", shadow: "shadow-emerald-500/10", href: "/admin/users" },
    { label: "Báo lỗi", val: stats.reports, icon: "⚠️", color: "from-red-600 to-orange-400", shadow: "shadow-red-500/10", href: "/admin/reports" },
    { label: "Bình luận", val: stats.comments, icon: "💬", color: "from-amber-600 to-yellow-400", shadow: "shadow-amber-500/10", href: "/admin/comments" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Bảng điều khiển</h1>
        <p className="text-gray-500 font-medium mt-1">Chào mừng trở lại, Patrick. Đây là tình hình hệ thống hôm nay.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          // CẬP NHẬT: Chuyển div ngoài cùng thành Link để click được toàn bộ card
          <Link 
            key={i} 
            href={c.href}
            className={`block bg-[#0d0d0d] border border-gray-800/50 p-6 rounded-3xl relative overflow-hidden group hover:border-gray-700 transition-all duration-500 ${c.shadow} shadow-2xl cursor-pointer`}
          >
            {/* Background Glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${c.color} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-gray-900 px-2 py-1 rounded-md">Realtime</span>
              </div>
              <h2 className={`text-4xl font-black mt-4 tracking-tight bg-gradient-to-r ${c.color} bg-clip-text text-transparent`}>
                {loading ? "---" : c.val.toLocaleString()}
              </h2>
              <p className="text-gray-500 text-xs font-bold uppercase mt-1 tracking-wider">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Khu vực chi tiết hệ thống */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Truyện vừa cập nhật */}
        <div className="lg:col-span-2 bg-[#0d0d0d] border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              Truyện vừa cập nhật
            </h3>
            {/* CẬP NHẬT: Đổi button thành Link về trang chủ "/" */}
            <Link href="/" className="text-xs font-bold text-blue-400 hover:underline">
              Xem tất cả
            </Link>
          </div>
          
          <div className="space-y-4">
            {latestStories.map((story: any) => (
              // CẬP NHẬT: Chuyển div item thành Link nhảy vào chi tiết truyện
              <Link 
                key={story.id} 
                href={`/id-story/${story.id}`}
                className="flex items-center justify-between p-4 bg-[#111] border border-gray-800/30 rounded-2xl hover:bg-[#161616] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <img src={story.thumbnail} alt="" className="w-10 h-14 object-cover rounded-lg shadow-lg" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">{story.tenTruyen}</h4>
                    <p className="text-[10px] text-gray-500 uppercase mt-1 font-bold">{story.tacGia || "Đang cập nhật"}</p>
                  </div>
                </div>
                <div className="text-right px-4">
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Chapter {story.chuongMoiNhat || '?'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Cột Quản Lý Thể Loại */}
        <div className="bg-[#0d0d0d] border border-gray-800/50 rounded-3xl p-6 flex flex-col shadow-2xl">
          <div className="mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="w-2 h-5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
              Quản lý Thể loại ({allTheLoais.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Xem, thêm mới hoặc xóa các thể loại truyện.</p>
          </div>

          <form onSubmit={handleAddGenre} className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Tên thể loại mới..." 
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              className="flex-1 bg-[#111] border border-gray-800 p-3 rounded-xl text-xs text-white placeholder-gray-600 outline-none focus:border-blue-600 transition-all"
            />
            <button 
              type="submit"
              className="px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-white active:scale-95"
            >
              Thêm
            </button>
          </form>

          <div className="flex-1 overflow-y-auto max-h-[260px] pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-800">
            {allTheLoais.map((tl) => (
              <div 
                key={tl.id} 
                className="flex items-center justify-between p-2.5 bg-[#111] hover:bg-[#161616] border border-gray-800/40 rounded-xl transition-all group"
              >
                <span className="text-[11px] font-bold uppercase text-gray-400 group-hover:text-blue-400 transition-colors tracking-wide">
                  {tl.ten}
                </span>
                <button 
                  type="button"
                  onClick={() => handleDeleteGenre(tl.id)}
                  className="w-5 h-5 flex items-center justify-center rounded-md bg-red-950/30 border border-red-900/30 text-red-500 text-xs font-bold hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  title="Xóa thể loại"
                >
                  &times;
                </button>
              </div>
            ))}
            {allTheLoais.length === 0 && (
              <p className="text-center text-xs text-gray-600 py-6">Chưa có thể loại nào.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}