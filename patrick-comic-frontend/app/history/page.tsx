"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "../components/Header"; 
import Footer from "../components/Footer";
import Link from "next/link";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      // Nếu session đang trong quá trình load, không làm gì cả
      if (status === "loading") return;

      // Nếu đã xác thực và có email
      if (status === "authenticated" && session?.user?.email) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/history?email=${session.user.email}`
          );
          if (res.ok) {
            const data = await res.json();
            setHistoryList(data);
          }
        } catch (error) {
          console.error("Lỗi fetch lịch sử:", error);
        } finally {
          setLoading(false); // Đảm bảo luôn tắt loading dù thành công hay lỗi
        }
      } else {
        // Trường hợp unauthenticated hoặc authenticated nhưng thiếu email
        setLoading(false);
      }
    };

    fetchHistory();
  }, [session, status]);

  // Chỉ hiện màn hình loading khi status thực sự là đang tải
  if (status === "loading" || (loading && status === "authenticated")) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-blue-500 font-black tracking-widest animate-pulse">
        ĐANG TẢI LỊCH SỬ...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Header />
      <main className="container mx-auto py-10 px-4 flex-grow">
        <h1 className="text-2xl font-black mb-8 uppercase text-blue-500 flex items-center gap-3">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span> Lịch sử đọc của tôi
        </h1>
        
        {status === "unauthenticated" ? (
          <div className="bg-[#121212] p-10 rounded-3xl border border-gray-800 text-center">
            <p className="text-gray-500 italic">Vui lòng đăng nhập để xem lịch sử đọc truyện.</p>
          </div>
        ) : historyList.length === 0 ? (
          <div className="bg-[#121212] p-10 rounded-3xl border border-gray-800 text-center">
             <p className="text-gray-500 italic">Bạn chưa đọc truyện nào gần đây.</p>
             <Link href="/" className="text-blue-500 mt-4 inline-block hover:underline">Khám phá ngay</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyList.map((item) => (
              <div key={item.id} className="bg-[#121212] p-4 rounded-2xl border border-gray-800 flex gap-4 hover:border-blue-600/50 transition-all group">
                <div className="w-20 h-28 shrink-0 overflow-hidden rounded-lg bg-gray-900">
                    <img 
                      src={item.truyen?.thumbnail || "/no-image.jpg"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={item.truyen?.tenTruyen}
                      referrerPolicy="no-referrer"
                    />
                </div>
                <div className="flex flex-col justify-between py-1 overflow-hidden">
                  <h3 className="font-bold text-sm line-clamp-2 uppercase group-hover:text-blue-400 transition-colors">
                    {item.truyen?.tenTruyen || "Truyện đã bị xóa"}
                  </h3>
                  <p className="text-gray-500 text-[11px]">
                    Chương: <span className="text-blue-500 font-bold">{item.chuong?.soChuong || "?"}</span>
                  </p>
                  <Link 
                    href={`/chapters-story/${item.truyen?.slug}/${item.chuong?.soChuong || 1}`}
                    className="text-[9px] bg-blue-600 hover:bg-blue-500 text-white w-fit px-4 py-1.5 rounded-full font-black mt-2 tracking-widest uppercase transition-all"
                  >
                    ĐỌC TIẾP
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}