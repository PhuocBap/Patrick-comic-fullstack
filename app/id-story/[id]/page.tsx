import CommentForm from "@/components/CommentForm";
import FollowButton from "@/components/FollowButton"; 
import { getComicDetail } from "../../../controllers/truyen.controller"; 
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // Thêm Footer
import { getServerSession } from "next-auth";
import { authOptions } from "../../../app/api/auth/[...nextauth]/route";
import DeleteChapterButton from "@/components/DeleteChapterButton"; 
import { notFound } from "next/navigation";

export default async function ComicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const comic = await getComicDetail(id) as any;
  const session = await getServerSession(authOptions);

  if (!comic) return notFound();

  const userRole = (session?.user as any)?.role || (session?.user as any)?.vaiTro;
  const isAdmin = userRole === "ADMIN";
  
  let isFollowed = false;
  if (session?.user) {
    const followRecord = await prisma.theoDoi.findUnique({
      where: {
        nguoiDungId_truyenId: {
          nguoiDungId: String((session.user as any).id), 
          truyenId: Number(id),
        },
      },
    });
    isFollowed = !!followRecord;
  }

  const chapters = comic.chuongs || []; 
  const sortedChapters = [...chapters].sort((a, b) => b.soChuong - a.soChuong);
  const firstChapter = [...chapters].sort((a, b) => a.soChuong - b.soChuong)[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans flex flex-col">
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-6xl flex-grow">
        
        {/* --- THANH ADMIN QUẢN TRỊ --- */}
        {isAdmin && (
          <div className="mb-8 p-5 bg-gradient-to-r from-red-900/40 to-black border border-red-500/50 rounded-2xl flex flex-wrap items-center justify-between shadow-2xl gap-4">
            <div className="flex items-center gap-4">
              <span className="bg-red-600 text-white text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest animate-pulse">ADMIN MODE</span>
              <p className="text-sm font-medium">Chào <span className="text-red-400">@{session?.user?.name}</span>, ông đang quản trị truyện này.</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/admin/edit-story/${id}`} className="bg-blue-600 hover:bg-blue-500 text-[11px] px-6 py-2.5 rounded-xl font-black transition-all text-white shadow-lg uppercase">SỬA TRUYỆN</Link>
              <Link href={`/admin/add-chapter?storyId=${id}`} className="bg-green-600 hover:bg-green-500 text-[11px] px-6 py-2.5 rounded-xl font-black transition-all text-white shadow-lg uppercase">THÊM CHƯƠNG</Link>
            </div>
          </div>
        )}

        {/* --- KHUNG THÔNG TIN TRUYỆN --- */}
        <div className="flex flex-col md:flex-row gap-10 bg-[#121212] p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[120px] -z-10"></div>
          
          <div className="w-full md:w-[280px] shrink-0">
            <img 
              src={comic.thumbnail || "/no-image.jpg"} 
              alt={comic.tenTruyen} 
              referrerPolicy="no-referrer"
              className="w-full rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] object-cover aspect-[3/4] border border-gray-800"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight leading-[1.1]">{comic.tenTruyen}</h1>
            <div className="flex flex-wrap gap-2 mb-8">
              {comic.theLoais?.map((tl: any) => (
                <Link key={tl.id} href={`/the-loai/${tl.id}`} className="px-5 py-2 bg-gray-800/50 text-blue-400 border border-gray-700/50 rounded-full text-[10px] font-black uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all">
                  {tl.ten} 
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-black/40 rounded-3xl border border-gray-800/50">
              <div className="flex flex-col border-r border-gray-800 text-center md:text-left">
                <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Tác giả</span>
                <span className="text-gray-200 font-bold mt-1 truncate">{comic.tacGia || "Ẩn danh"}</span>
              </div>
              <div className="flex flex-col border-r border-gray-800 pl-2 text-center md:text-left">
                <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Trạng thái</span>
                <span className="text-blue-500 font-bold mt-1 uppercase text-[11px]">{comic.trangThai === 'HOAN_THANH' ? 'Xong' : 'Đang ra'}</span>
              </div>
              <div className="flex flex-col pl-2 text-center md:text-left">
                <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Lượt xem</span>
                <span className="text-gray-200 font-bold mt-1">{new Intl.NumberFormat('vi-VN').format(comic.luotXem || 0)}</span>
              </div>
            </div>
            
            <div className="relative mb-8">
              <p className="text-gray-400 leading-relaxed text-sm italic bg-gray-900/20 p-6 rounded-2xl border-l-4 border-blue-600">
                {comic.moTa || "Chưa có mô tả cho truyện này."}
              </p>
            </div>

            <div className="flex flex-wrap gap-5 items-center mt-auto">
              {firstChapter ? (
                <Link 
                  href={`/chapters-story/${comic.slug}/${firstChapter.soChuong}`} 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3.5 rounded-full font-black transition-all shadow-xl uppercase text-[12px] tracking-widest active:scale-95 text-center"
                >
                  ĐỌC TỪ ĐẦU
                </Link>
              ) : (
                <button disabled className="bg-gray-800 text-gray-500 px-10 py-3.5 rounded-full font-black uppercase text-[12px] cursor-not-allowed">CHƯA CÓ CHƯƠNG</button>
              )}
              <FollowButton truyenId={Number(id)} isFollowedInitial={isFollowed} />
            </div>
          </div>
        </div>

        {/* --- DANH SÁCH CHƯƠNG --- */}
        <div className="mt-12 bg-[#121212] rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-gray-800/50">
          <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">DANH SÁCH CHƯƠNG <span className="text-blue-500 ml-1">({chapters.length})</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedChapters.map((chuong: any) => (
              <div key={chuong.id} className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-gray-800/50 hover:border-blue-600/50 hover:bg-blue-600/5 transition-all group">
                <Link href={`/chapters-story/${comic.slug}/${chuong.soChuong}`} className="flex-1 text-sm font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
                  Chương {chuong.soChuong}: <span className="font-medium ml-1 text-gray-500 group-hover:text-blue-300/70">{chuong.tenChuong || "Đang cập nhật"}</span>
                </Link>
                {isAdmin && (
                  <div className="flex items-center gap-3 border-x border-gray-800 px-3">
                    <Link href={`/admin/edit-chapter/${chuong.id}`} className="text-[10px] font-black text-blue-500 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all uppercase">SỬA</Link>
                    <DeleteChapterButton chapterId={chuong.id} />
                  </div>
                )}
                <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest min-w-[70px] text-right">
                  {chuong.ngayTao ? new Date(chuong.ngayTao).toLocaleDateString('vi-VN') : 'Mới đây'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- THẢO LUẬN --- */}
        <div className="my-12 bg-[#121212] p-6 md:p-10 rounded-[2.5rem] border border-gray-800/50 shadow-2xl">
            <h3 className="text-blue-500 text-[11px] font-black uppercase mb-8 flex items-center gap-3 tracking-[0.2em]">
                <span className="w-2 h-5 bg-blue-600 rounded-full"></span> Thảo luận cộng đồng
            </h3>
            <CommentForm truyenId={Number(id)} />
        </div>
      </div>
      <Footer /> {/* Thêm Footer ở cuối */}
    </div> 
  ); 
}