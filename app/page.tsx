import Header from "@/components/Header";
import ComicList from "@/components/ComicList";
import Pagination from "@/components/Pagination";
import TopViews from "@/components/TopViews"; 
import Footer from "@/components/Footer";     
import { prisma } from "../lib/prisma"; 

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  
  let currentPage = parseInt(resolvedParams.page || "1");
  if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

  const limit = 12;
  const skip = (currentPage - 1) * limit;

  const [initialComics, totalTruyen] = await Promise.all([
    prisma.truyen.findMany({
      skip: skip,
      take: limit,
      orderBy: { id: "desc" },
    }),
    prisma.truyen.count(),
  ]);

  const totalPages = Math.ceil(totalTruyen / limit);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Header />
      
      <div className="container mx-auto py-10 px-4 flex-grow">
        {/* PHẦN 1: TRUYỆN MỚI CẬP NHẬT */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15_rgba(37,99,235,0.5)]"></div>
          <h2 className="text-3xl font-bold italic tracking-tight uppercase">
            Truyện mới cập nhật
          </h2>
        </div>
        
        <div className="min-h-[600px]">
          <ComicList 
            key={currentPage} 
            initialComics={JSON.parse(JSON.stringify(initialComics))} 
            totalPages={totalPages}
            currentPage={currentPage}
          />
        </div>

        <div className="mt-12 mb-16">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
          />
        </div>

        {/* PHẦN 2: XEM NHIỀU (Dàn hàng ngang 3 truyện/dòng) */}
        <TopViews />
      </div>

      <Footer />
    </main>
  );
}