import { getServerSession } from "next-auth";
import { prisma } from "../../lib/prisma";
import ComicList from "../../app/components/ComicList";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "../../app/components/Header";
import Footer from "../../app/components/Footer";

export default async function HistoryPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.nguoiDung.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return <div className="text-center py-20 text-white bg-[#0a0a0a] min-h-screen">Người dùng không tồn tại.</div>;

  const historyData = await prisma.lichSuDoc.findMany({
    where: { nguoiDungId: user.id },
    orderBy: { thoiGianDoc: "desc" },
    include: {
      truyen: true,
      chuong: true,
    },
  });

  // Chuyển đổi dữ liệu để hiển thị số chương đang đọc
  const comics = historyData.map((h) => ({
    ...h.truyen,
    readingChapter: h.chuong.soChuong,
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-10 flex-grow">
        {/* Tiêu đề trang với phong cách PatricComic */}
        <div className="flex items-center gap-3 mb-10 border-b border-gray-800 pb-4">
          <div className="h-8 w-1.5 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
            LỊCH SỬ <span className="text-blue-500">ĐỌC TRUYỆN</span>
          </h1>
        </div>

        {comics.length > 0 ? (
          <div className="animate-in fade-in duration-700">
             <ComicList initialComics={comics} />
          </div>
        ) : (
          /* Trạng thái trống được thiết kế lại theo tông màu dark-gray */
          <div className="flex flex-col items-center justify-center py-24 bg-[#121212] rounded-[2rem] border border-gray-800 shadow-2xl mx-auto max-w-2xl">
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg font-medium mb-6">Bạn chưa lưu lại hành trình đọc truyện nào.</p>
            <Link 
              href="/" 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-900/20 uppercase text-sm tracking-widest"
            >
              Khám phá ngay
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}