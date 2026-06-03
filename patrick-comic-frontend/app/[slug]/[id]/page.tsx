"use client";
import { useEffect, useState, use, Suspense } from "react";
import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CommentForm from "../../components/CommentForm";
import FollowButton from "../../components/FollowButton";
import DeleteChapterButton from "../../components/DeleteChapterButton";
import BannerAds from "../../components/BannerAds";

interface PageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default function ComicDetailPage({ params }: PageProps) {
  const { id, slug } = use(params); 
  const { data: session, status: authStatus } = useSession();
  const [comic, setComic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${backendUrl}/stories/${id}`);
        
        if (!res.ok) {
          if (res.status === 404) setComic(null);
          return;
        }
        
        const data = await res.json();
        setComic(data);

        if (data.slug && slug !== data.slug) {
          window.history.replaceState(null, "", `/${data.slug}/${id}`);
        }

        const userId = (session?.user as any)?.id;
        if (authStatus === "authenticated" && userId) {
          const followRes = await fetch(
            `${backendUrl}/follow/status?userId=${userId}&truyenId=${id}`
          );
          if (followRes.ok) {
            const { followed } = await followRes.json();
            setIsFollowed(followed);
          }
        }
      } catch (error) {
        console.error("Lỗi fetch chi tiết truyện:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchDetail();
  }, [id, slug, session, authStatus, backendUrl]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!comic) return notFound();

  const isAdmin = (session?.user as any)?.role === "ADMIN" || (session?.user as any)?.vaiTro === "ADMIN";
  const chapters = comic.chuongs || [];
  const sortedChapters = [...chapters].sort((a, b) => b.soChuong - a.soChuong);
  const firstChapter = [...chapters].sort((a, b) => a.soChuong - b.soChuong)[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans flex flex-col">
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-6xl flex-grow">
        
        <BannerAds />

        {isAdmin && (
          <div className="mb-8 p-5 bg-gradient-to-r from-red-900/40 to-black border border-red-500/50 rounded-2xl flex justify-between items-center shadow-2xl mt-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold uppercase tracking-wider text-red-400">Admin Control Mode</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/admin/edit-story/${id}`} className="bg-blue-600 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase hover:bg-blue-700 transition-all">Sửa truyện</Link>
              <Link href={`/admin/add-chapter?storyId=${id}`} className="bg-green-600 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase hover:bg-green-700 transition-all">Thêm chương</Link>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-10 bg-[#121212] p-6 md:p-10 rounded-[2.5rem] border border-gray-800/50 shadow-2xl relative overflow-hidden mt-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full"></div>
          <div className="w-full md:w-[280px] shrink-0 z-10">
            <img 
  src={comic.thumbnail?.replace(/src=http:\/\//g, 'src=https://') || "/no-image.jpg"} 
  alt={comic.tenTruyen} 
  referrerPolicy="no-referrer" 
  className="w-full rounded-[2rem] shadow-2xl object-cover aspect-[3/4] border border-gray-700 hover:border-blue-600 transition-all" 
/>
          </div>

          <div className="flex-1 flex flex-col z-10">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight leading-tight">{comic.tenTruyen}</h1>
            <div className="flex flex-wrap gap-2 mb-8">
              {/* Giữ nguyên logic render an toàn theo thuộc tính 'ten' */}
              {comic.theLoais?.map((tl: any) => (
                <Link key={tl.id} href={`/the-loai/${tl.id}`} className="px-5 py-2 bg-blue-600/10 text-blue-400 rounded-full text-[10px] font-black uppercase border border-blue-900/30 hover:bg-blue-600 hover:text-white transition-all">
                  {tl.ten}
                </Link>
              ))}
            </div>
            <p className="text-gray-400 leading-relaxed text-sm italic bg-black/40 p-6 rounded-2xl border-l-4 border-blue-600 mb-8 backdrop-blur-sm">
              {comic.moTa || "Chưa có mô tả cho bộ truyện này."}
            </p>
            <div className="flex flex-wrap gap-5 mt-auto">
              {firstChapter && (
                <Link href={`/chapters-story/${comic.slug}/${firstChapter.soChuong}`} className="bg-blue-600 px-10 py-4 rounded-full font-black text-[12px] uppercase hover:bg-blue-500 transition-all shadow-lg active:scale-95">
                  Đọc từ đầu
                </Link>
              )}
              <Suspense fallback={<div className="text-sm text-gray-500 animate-pulse">Loading...</div>}>
                <FollowButton truyenId={Number(id)} isFollowedInitial={isFollowed} />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-[#121212] rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-gray-800/50">
          <h2 className="text-2xl font-black text-white uppercase flex items-center gap-3 mb-8">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            Danh sách chương ({chapters.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedChapters.map((chuong: any) => {
              const textTenChuong = chuong.tenChuong ? chuong.tenChuong.trim() : "";
              const lowerTenChuong = textTenChuong.toLowerCase();
              
              const laTenChuongHopLe = 
                textTenChuong !== "" && 
                lowerTenChuong !== `chapter ${chuong.soChuong}` && 
                lowerTenChuong !== `chương ${chuong.soChuong}` &&
                lowerTenChuong !== `chuong ${chuong.soChuong}`;

              return (
                <div key={chuong.id} className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-gray-800/50 hover:border-blue-600/30 group transition-all">
                  <Link href={`/chapters-story/${comic.slug}/${chuong.soChuong}`} className="flex-1 text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                    Chương {chuong.soChuong}
                    {laTenChuongHopLe && (
                      <>: {textTenChuong}</>
                    )}
                  </Link>
                  {isAdmin && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/edit-chapter/${chuong.id}`} className="p-2 bg-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white rounded-lg transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </Link>
                      <DeleteChapterButton chapterId={chuong.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 bg-[#121212] rounded-[2.5rem] p-6 md:p-10 border border-gray-800/50">
          <CommentForm truyenId={Number(id)} />
        </div>
      </div>
      <Footer />
    </div> 
  ); 
}