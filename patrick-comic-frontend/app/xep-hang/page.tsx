"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link"; // IMPORT LINK
import Header from "../components/Header";
import Footer from "../components/Footer";

function XepHangContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("top") || "ngay"; 
  const [truyens, setTruyens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stories/xep-hang?type=${type}&t=${Date.now()}`);
        if (!res.ok) throw new Error("Lỗi API");
        const data = await res.json();
        setTruyens(data.data || data);
      } catch (error) {
        console.error("Lỗi fetch top:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, [type]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black uppercase italic mb-8 tracking-tighter">Bảng Xếp Hạng</h1>
          <div className="flex justify-center gap-3">
            {['ngay', 'tuan', 'thang'].map((t) => (
              <Link
                key={t}
                href={`/xep-hang?top=${t}`}
                className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                  type === t 
                  ? 'bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                  : 'bg-[#121212] border-gray-800 text-gray-500 hover:text-gray-300'
                }`}
              >
                {t === 'ngay' ? 'Ngày' : t === 'tuan' ? 'Tuần' : 'Tháng'}
              </Link>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-blue-500 font-black animate-pulse">ĐANG TẢI DỮ LIỆU...</div>
        ) : (
          <div className="space-y-12">
            {/* KHU VỰC TOP 1, 2, 3 */}
            <div className="flex flex-wrap justify-center items-end gap-6">
              {truyens.slice(0, 3).map((truyen, index) => {
                const isTop1 = index === 0;
                const config = [
                  { color: 'border-yellow-500', shadow: 'shadow-yellow-500/20', size: 'w-72 h-[420px]', label: '🥇 Top 1' },
                  { color: 'border-gray-400', shadow: 'shadow-gray-400/20', size: 'w-64 h-[380px]', label: '🥈 Top 2' },
                  { color: 'border-orange-500', shadow: 'shadow-orange-500/20', size: 'w-64 h-[380px]', label: '🥉 Top 3' }
                ][index];

                return (
                  <Link 
                    href={`/${truyen.slug}/${truyen.id}`} // ĐIỀU HƯỚNG TỚI TRANG CHI TIẾT
                    key={truyen.id} 
                    className={`relative group block ${isTop1 ? 'order-1 md:order-2 scale-105' : index === 1 ? 'order-2 md:order-1' : 'order-3'}`}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black px-4 py-1 rounded-full border border-gray-800 text-[10px] font-bold z-10 uppercase">
                      {config.label}
                    </div>
                    <div className={`relative overflow-hidden rounded-2xl border-2 ${config.color} ${config.shadow} ${config.size} transition-all group-hover:-translate-y-2`}>
                      <img src={truyen.thumbnail} alt={truyen.tenTruyen} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 p-5 w-full">
                        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-blue-400 transition-colors">{truyen.tenTruyen}</h3>
                        <p className="text-blue-400 text-sm font-bold">Chương {truyen.chuongMoiNhat}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* KHU VỰC TOP 4 - 10 */}
            <div className="max-w-4xl mx-auto grid gap-3">
              {truyens.slice(3, 10).map((truyen, index) => (
                <Link 
                  href={`/${truyen.slug}/${truyen.id}`} // ĐIỀU HƯỚNG TỚI TRANG CHI TIẾT
                  key={truyen.id} 
                  className="flex items-center gap-4 bg-[#121212] p-3 rounded-xl border border-gray-900 hover:bg-[#1a1a1a] hover:border-gray-700 transition-all group"
                >
                  <span className="w-10 text-center text-2xl font-black text-gray-800 italic">{index + 4}</span>
                  <img src={truyen.thumbnail} className="w-12 h-16 object-cover rounded-lg" alt="" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-200 line-clamp-1 group-hover:text-blue-400 transition-colors">{truyen.tenTruyen}</h4>
                    <p className="text-gray-500 text-xs">Mới nhất: Chương {truyen.chuongMoiNhat}</p>
                  </div>
                  <div className="text-right px-4">
                    <span className="block text-[10px] text-gray-600 uppercase font-bold">Lượt xem</span>
                    <span className="text-blue-500 font-black">{(truyen.luotXemThang || 0).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

export default function XepHangPage() {
  return (
    <Suspense fallback={null}>
      <XepHangContent />
    </Suspense>
  );
}