"use client";
import { useEffect, useState, use } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ComicList from "../../components/ComicList";

export default function DanhSachTruyenPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = use(params);
  const [truyens, setTruyens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 THÊM CÁC STATE QUẢN LÝ PHÂN TRANG
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 12; // Số lượng truyện hiển thị trên 1 trang (Khớp với Controller mặc định)

  const statusMap: Record<string, string> = {
    "dang-ra": "SAP_RA_MAT", 
    "sap-ra-mat": "SAP_RA_MAT", 
    "hoan-thanh": "HOAN_THANH",
  };

  // Mỗi khi đổi 'status' (loại truyện) thì reset về trang 1
  useEffect(() => {
    setPage(1);
  }, [status]);

  useEffect(() => {
    const fetchTruyens = async () => {
      const backendStatus = statusMap[status];
      if (!backendStatus) return;

      setLoading(true);
      try {
        // 🔥 ĐÃ CẬP NHẬT: Thêm query param &page và &limit gửi lên Backend
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/stories?trangThai=${backendStatus}&page=${page}&limit=${limit}`;
        
        const res = await fetch(url, { cache: 'no-store' });
        const result = await res.json();
        
        // Backend trả về dạng: { data: [...], totalPages: X }
        if (result && result.data) {
          setTruyens(result.data);
          setTotalPages(result.totalPages || 1);
        } else {
          // Phòng hờ fallback nếu dữ liệu trả về mảng trực tiếp
          const finalData = Array.isArray(result) ? result : [];
          setTruyens(finalData);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTruyens();
  }, [status, page]); // 🔥 Chạy lại effect khi đổi trang (page)

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-black uppercase italic border-l-4 border-blue-600 pl-4 mb-10">
          {status === "hoan-thanh" ? "Truyện Đã Hoàn Thành" : "Truyện Sắp Ra Mắt"}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => <div key={i} className="aspect-[3/4] bg-[#161b22] rounded-2xl" />)}
          </div>
        ) : (
          <>
            {/* Hiển thị danh sách truyện */}
            <ComicList initialComics={truyens} />

            {/* 🔥 THÊM GIAO DIỆN THANH PHÂN TRANG (PAGINATION) */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-[#161b22] border border-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Trước
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                        page === pageNumber
                          ? "bg-blue-600 text-white"
                          : "bg-[#161b22] border border-gray-800 hover:bg-[#21262d]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-[#161b22] border border-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}