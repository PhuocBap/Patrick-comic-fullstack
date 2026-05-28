"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export default function FollowList() {
  const { data: session, status } = useSession();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadList = useCallback(async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/follow?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Lỗi Dropdown FollowList:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") loadList();
  }, [status, loadList]);

  if (status !== "authenticated") return null;

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 text-pink-400 font-black bg-pink-400/10 px-4 py-2 rounded-full border border-pink-400/20 hover:bg-pink-400 hover:text-white transition-all">
        ❤️ {list.length}
      </button>

      <div className="absolute hidden group-hover:flex flex-col bg-[#111] border border-gray-800 mt-2 p-2 rounded-2xl shadow-2xl w-72 z-[100] right-0 top-full">
        <div className="p-4">
          <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest text-center">Danh sách yêu thích</p>
          
          {loading ? (
            <p className="text-center text-xs animate-pulse text-gray-600">Đang cập nhật...</p>
          ) : list.length > 0 ? (
            <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
              {list.slice(0, 5).map((item) => (
                <Link key={item.id} href={`/${item.slug}/${item.truyen?.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-xl transition-all">
                  <img src={item.truyen?.thumbnail || "/no-image.jpg"} className="w-10 h-14 object-cover rounded-md" alt="" />
                  <span className="text-sm font-bold text-gray-200 truncate">{item.truyen?.tenTruyen}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-600 py-4">Trống trơn...</p>
          )}
          
          <Link href="/theo-doi" className="block text-center mt-4 pt-3 border-t border-gray-800 text-[11px] font-black text-blue-500 hover:text-blue-400">
            XEM TẤT CẢ
          </Link>
        </div>
      </div>
    </div>
  );
}