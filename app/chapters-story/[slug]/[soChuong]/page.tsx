import { prisma } from "../../../../lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import CommentForm from "@/components/CommentForm";
import SaveHistory from "@/components/SaveHistory"; // Import component mới tạo
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
    soChuong: string;
  }>;
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug, soChuong } = await params;
  const currentNumber = parseFloat(soChuong);
  if (isNaN(currentNumber)) return notFound();

  const chapter = await prisma.chuong.findFirst({
    where: {
      soChuong: currentNumber,
      truyen: { slug: slug },
    },
    include: { 
      truyen: {
        select: {
          id: true,
          tenTruyen: true,
          slug: true
        }
      } 
    },
  });

  if (!chapter || !chapter.truyen) return notFound();

  const allChapters = await prisma.chuong.findMany({
    where: { truyenId: chapter.truyenId },
    orderBy: { soChuong: "asc" },
    select: { id: true, soChuong: true },
  });

  const currentIndex = allChapters.findIndex((c) => c.soChuong === currentNumber);
  const prevChapter = allChapters[currentIndex - 1];
  const nextChapter = allChapters[currentIndex + 1];

  const danhSachAnh = chapter.noiDung
    ? chapter.noiDung.split(/[\n,]/).map((link) => link.trim()).filter((l) => l !== "")
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
      {/* Component ẩn để lưu lịch sử vào DB */}
      <SaveHistory truyenId={chapter.truyenId} chuongId={chapter.id} />
      
      <Header />
      <main className="container mx-auto py-8 px-4 flex flex-col items-center flex-grow">
        <div className="mb-10 text-center bg-[#121212] p-8 rounded-[2rem] border border-gray-800 w-full max-w-3xl shadow-2xl">
          <h1 className="text-2xl md:text-3xl font-black text-blue-500 mb-3 uppercase tracking-tight">
            {chapter.truyen.tenTruyen}
          </h1>
          <div className="text-gray-400 font-bold bg-black/40 inline-block px-6 py-2 rounded-full border border-gray-800">
            Chương {chapter.soChuong}: {chapter.tenChuong }
          </div>
        </div>

        <div className="w-full max-w-4xl flex flex-col bg-black shadow-2xl border border-gray-900 overflow-hidden rounded-lg">
          {danhSachAnh.length > 0 ? (
            danhSachAnh.map((url, idx) => (
              <img 
                key={idx} 
                src={url} 
                referrerPolicy="no-referrer" 
                alt={`Trang ${idx + 1}`} 
                className="w-full h-auto block"
                loading={idx > 2 ? "lazy" : "eager"}
              />
            ))
          ) : (
            <div className="py-32 text-center text-gray-600 italic">Nội dung đang được chuẩn bị...</div>
          )}
        </div>

        <div className="w-full max-w-4xl my-16 bg-[#121212] p-8 rounded-[2.5rem] border border-gray-800">
          <h3 className="text-xl font-black mb-8 text-gray-200 flex items-center gap-3">
             <span className="w-2 h-6 bg-blue-600 rounded-full"></span> THẢO LUẬN
          </h3>
          <ul className="space-y-4">
             <CommentForm truyenId={chapter.truyenId} chuongId={chapter.id} />
          </ul>
        </div>
      </main>

      <Footer />
      <div className="h-20"></div>
      <BottomNav
        chapters={allChapters}
        currentChapterId={chapter.id}
        prevChapterSo={prevChapter?.soChuong}
        nextChapterSo={nextChapter?.soChuong}
        truyenId={chapter.truyenId}
        slug={slug}
      />
    </div>
  );
}