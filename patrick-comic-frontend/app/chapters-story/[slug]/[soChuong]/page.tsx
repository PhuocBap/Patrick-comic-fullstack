"use client";
import { useEffect, useState, use } from "react";
import { notFound, useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import BottomNav from "../../../components/BottomNav";
import CommentForm from "../../../components/CommentForm";
import SaveHistory from "../../../components/SaveHistory";
import ChapterInfo from "../../../components/ChapterInfo";
import BannerAds from "../../../components/BannerAds";

interface PageProps {
  params: Promise<{
    slug: string;
    soChuong: string;
  }>;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export default function ChapterPage({ params }: PageProps) {
  const { slug, soChuong } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/chuong/find?slug=${slug}&soChuong=${soChuong}`);
        if (!res.ok) {
          setData(null);
          return;
        }
        const result = await res.json();
        setData(result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error("Lỗi fetch chapter:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChapterData();
  }, [slug, soChuong]);

  const chapter = data;
  const allChapters = data?.truyen?.chuongs || [];
  const currentIndex = allChapters.findIndex((c: any) => c.soChuong === Number(soChuong));
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prevChapter) {
        router.push(`/chapters-story/${slug}/${prevChapter.soChuong}`);
      } else if (e.key === "ArrowRight" && nextChapter) {
        router.push(`/chapters-story/${slug}/${nextChapter.soChuong}`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevChapter, nextChapter, slug, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-500 font-black tracking-widest animate-pulse uppercase text-sm">ĐANG TẢI NỘI DUNG...</p>
        </div>
    </div>
  );

  if (!data || !data.id) return notFound();

  const danhSachAnh = chapter.noiDung
    ? chapter.noiDung.split(/[\n,]/).map((link: string) => link.trim()).filter((l: string) => l !== "")
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
      <SaveHistory truyenId={chapter.truyenId} chuongId={chapter.id} />
      <Header />

      <main className="container mx-auto py-6 px-4 flex flex-col items-center flex-grow">
        <ChapterInfo 
          comicName={chapter.truyen.tenTruyen}
          chapterNumber={chapter.soChuong}
          updatedAt={chapter.ngayCapNhat}
          prevSlug={prevChapter ? `/chapters-story/${slug}/${prevChapter.soChuong}` : ""}
          nextSlug={nextChapter ? `/chapters-story/${slug}/${nextChapter.soChuong}` : ""}
          truyenId={chapter.truyenId}
          slug={slug}
          allChapters={allChapters}
          currentChapterId={chapter.id}
        />

        <div className="w-full max-w-4xl flex flex-col bg-black shadow-2xl border-x border-gray-900 mt-8">
          
          {/* QUẢNG CÁO ĐÃ ĐƯỢC THU NHỎ NẰM TRƯỚC HÌNH ẢNH TRUYỆN */}
          <BannerAds />
          
          {danhSachAnh.length > 0 ? (
            danhSachAnh.map((url: string, idx: number) => (
              <img 
                key={`img-${chapter.id}-${idx}`}
                src={url} 
                referrerPolicy="no-referrer" 
                alt={`Trang ${idx + 1}`} 
                className="w-full h-auto block select-none" 
                loading={idx > 2 ? "lazy" : "eager"} 
              />
            ))
          ) : (
            <div className="py-20 text-center text-gray-500 italic">Không có nội dung hình ảnh.</div>
          )}
        </div>

        <div className="w-full max-w-4xl my-16 bg-[#121212] p-6 md:p-10 rounded-[3rem] border border-gray-800/50 shadow-2xl">
          <h3 className="text-lg font-black mb-10 text-white flex items-center gap-3 tracking-widest uppercase">
              <span className="w-2 h-7 bg-blue-600 rounded-full"></span> 
              Thảo luận chương
          </h3>
          <CommentForm truyenId={chapter.truyenId} chuongId={chapter.id} />
        </div>
      </main>

      <Footer />
      <div className="h-24"></div>
      
      <BottomNav 
        chapters={allChapters} 
        currentChapterId={chapter.id} 
        currentSoChuong={chapter.soChuong}
        prevChapterSo={prevChapter?.soChuong} 
        nextChapterSo={nextChapter?.soChuong} 
        truyenId={chapter.truyenId} 
        slug={slug} 
      />
    </div>
  ); 
}