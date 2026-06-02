"use client";
import { useEffect, useState, use } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ComicList from "../../components/ComicList";

export default function DanhSachTruyenPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = use(params);
  const [truyens, setTruyens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ĐÃ SỬA: Ánh xạ "dang-ra" (hoặc bạn có thể đổi thành "sap-ra-mat") sang "SAP_RA_MAT"
  const statusMap: Record<string, string> = {
    "dang-ra": "SAP_RA_MAT", 
    "sap-ra-mat": "SAP_RA_MAT", // Thêm dòng này để nếu bạn đổi cả thư mục router thành /sap-ra-mat vẫn chạy được
    "hoan-thanh": "HOAN_THANH",
  };

  useEffect(() => {
    const fetchTruyens = async () => {
      const backendStatus = statusMap[status];
      if (!backendStatus) return;

      setLoading(true);
      try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/stories?trangThai=${backendStatus}`;
        
        const res = await fetch(url, { cache: 'no-store' });
        const result = await res.json();
        
        const finalData = Array.isArray(result) ? result : (result.data || []);
        setTruyens(finalData);
      } catch (error) {
        console.error("Lỗi kết nối:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTruyens();
  }, [status]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <div className="container mx-auto max-w-7xl px-4 py-10">
        {/* ĐÃ SỬA: Đổi tiêu đề hiển thị từ "Truyện Đang Tiến Hành" thành "Truyện Sắp Ra Mắt" */}
        <h1 className="text-3xl font-black uppercase italic border-l-4 border-blue-600 pl-4 mb-10">
          {status === "hoan-thanh" ? "Truyện Đã Hoàn Thành" : "Truyện Sắp Ra Mắt"}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => <div key={i} className="aspect-[3/4] bg-[#161b22] rounded-2xl" />)}
          </div>
        ) : (
          <ComicList initialComics={truyens} />
        )}
      </div>
      <Footer />
    </main>
  );
}