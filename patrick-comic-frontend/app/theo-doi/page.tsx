"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import ComicCard from "../components/ComicCard";
import AuthModal from "../components/AuthModal"; // Import Modal của ông vào đây

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export default function TheoDoiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [followedItems, setFollowedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State để điều khiển Modal đăng nhập
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchFollowed = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/follow?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setFollowedItems(data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách theo dõi:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userId = (session?.user as any)?.id;
    if (status === "authenticated" && userId) {
      fetchFollowed(userId);
    } else {
      setLoading(false);
    }
  }, [status, session, fetchFollowed]);

  // Loading khi đang check session
  if (status === "loading") return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-black text-blue-500 animate-pulse">
      ĐANG KIỂM TRA ĐĂNG NHẬP...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      
      <div className="container mx-auto py-10 px-4">
        {/* Tiêu đề trang */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-2 h-10 bg-blue-600 rounded-full shadow-lg shadow-blue-900/50"></div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Truyện Đang Theo Dõi</h2>
        </div>

        {status === "unauthenticated" ? (
          /* GIAO DIỆN KHI CHƯA ĐĂNG NHẬP (GIỐNG DẠNG MODAL) */
          <div className="max-w-2xl mx-auto mt-10 p-12 bg-[#161b22] rounded-[2.5rem] border border-gray-800 text-center shadow-2xl relative overflow-hidden group">
            {/* Trang trí nền cho giống web phim cao cấp */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-500"></div>
            
            <h3 className="text-2xl font-black text-blue-500 uppercase mb-4 tracking-widest">Dừng khoảng chừng là 2 giây!</h3>
            <p className="text-gray-400 font-medium mb-8 leading-relaxed">
              Ông cần <span className="text-white font-bold">Đăng nhập</span> để xem và quản lý danh sách truyện đang theo dõi của mình.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all active:scale-95 uppercase shadow-xl shadow-blue-900/40 w-full sm:w-auto"
              >
                Đăng nhập ngay
              </button>
              <button 
                onClick={() => router.push('/')}
                className="px-10 py-4 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 font-bold rounded-2xl transition-all w-full sm:w-auto"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-20 text-blue-500 font-bold animate-bounce">ĐANG TẢI DỮ LIỆU...</div>
        ) : followedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {followedItems.map((item: any) => (
              <ComicCard key={item.id} comic={item.truyen} />
            ))}
          </div>
        ) : (
          /* GIAO DIỆN KHI TRỐNG */
          <div className="text-center py-40 bg-[#111] rounded-[3rem] border-2 border-dashed border-gray-800/50">
            <p className="text-gray-500 font-bold text-xl uppercase italic tracking-wider">Ông chưa theo dõi bộ nào hết!</p>
            <button 
                onClick={() => router.push('/')} 
                className="mt-8 px-8 py-3 bg-gray-800/50 hover:bg-blue-600 text-white rounded-xl font-black transition-all group"
            >
                ĐI TÌM TRUYỆN NGAY 
                <span className="inline-block ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>
        )}
      </div>

      {/* Tích hợp AuthModal của ông vào đây để khi bấm nút Đăng nhập nó hiện lên */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode="login" 
      />
    </main>
  );
}