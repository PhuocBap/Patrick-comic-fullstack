import { prisma } from "../../../lib/prisma";
import ComicCard from "../../components/ComicCard";
import Header from "@/components/Header";

export default async function TheLoaiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const genreId = id; 

  try {
    const theLoai = await prisma.theLoai.findUnique({
      where: { id: genreId },
      include: {
        truyens: {
          orderBy: {
            ngayTao: 'desc' 
          }
        }
      }
    });

    if (!theLoai) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
          <h2 className="text-2xl font-black mb-4 uppercase">404 - KHÔNG TÌM THẤY THỂ LOẠI</h2>
        </div>
      );
    }

    return (
      <main className="min-h-screen bg-[#0a0a0a] text-gray-100 pb-20 font-sans">
        <Header />
        
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-10 bg-blue-600 rounded-full shadow-lg shadow-blue-900/20"></div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
              Thể loại: <span className="text-blue-500">{theLoai.ten}</span>
            </h1>
          </div>
          
          {theLoai.truyens && theLoai.truyens.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {theLoai.truyens.map((comic: any) => (
                <ComicCard key={comic.id} comic={comic} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
              <p className="text-gray-500 font-medium italic text-lg">Chưa có truyện nào thuộc thể loại này.</p>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error("Lỗi trang Thể loại:", error);
    return <div className="min-h-screen bg-[#0a0a0a] text-red-500 p-10 text-center">LỖI KẾT NỐI DATABASE!</div>;
  }
}