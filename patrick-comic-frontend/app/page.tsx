import Header from "./components/Header";
import ComicList from "./components/ComicList";
import Pagination from "./components/Pagination";
import TopViews from "./components/TopViews"; 
import Footer from "./components/Footer"; 
import { getLatestComics } from "@/lib/api-client"; 

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1") || 1);
  const limit = 12;

  // Gọi API
  const result = await getLatestComics(currentPage, limit);
  
  // FIX LỖI TypeScript: Vì api-client trả về { data, totalPages }
  const comics = result.data; 
  const totalPages = result.totalPages;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Header />
      <div className="container mx-auto py-10 px-4 flex-grow">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
          <h2 className="text-3xl font-bold italic tracking-tight uppercase">
            Truyện mới cập nhật
          </h2>
        </div>
        
        <div className="min-h-[600px]">
          {comics && comics.length > 0 ? (
            <>
              <ComicList 
                initialComics={comics} 
                totalPages={totalPages}
                currentPage={currentPage}
              />
              <div className="mt-12">
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-800 rounded-3xl bg-[#111]">
               <span className="text-6xl mb-6 opacity-50">🔍</span>
               <p className="text-gray-400 text-xl font-medium">Chưa có bản cập nhật nào.</p>
            </div>
          )}
        </div>

        <div className="pt-10 border-t border-gray-900 mt-10">
          <TopViews />
        </div>
      </div>
      <Footer />
    </main>
  );
}