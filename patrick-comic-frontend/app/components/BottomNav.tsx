'use client';
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import ChapterNavigation from "./ChapterNavigation";
import BaoLoiModal from "./ReportModal";

interface BottomNavProps {
  chapters: { id: number; soChuong: number }[];
  currentChapterId: number;
  currentSoChuong: number; 
  prevChapterSo?: number; 
  nextChapterSo?: number; 
  truyenId: number; 
  slug: string; 
}

export default function BottomNav({ 
  chapters, 
  currentChapterId,
  currentSoChuong, 
  prevChapterSo, 
  nextChapterSo, 
  truyenId,
  slug 
}: BottomNavProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpenReport, setIsOpenReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTheoDoi = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) {
      alert("Ông phải đăng nhập mới theo dõi được chứ!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3001/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, truyenId: Number(truyenId) }),
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Thành công!");
        router.refresh(); 
      } else {
        alert(result.message || "Có lỗi gì đó rồi!");
      }
    } catch (error) {
      alert("Không kết nối được tới server!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/95 backdrop-blur-md border-t border-gray-800 px-4 py-3 z-50 pointer-events-auto">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[11px] md:text-sm font-medium text-white">
          
          {/* Nhóm nút bên trái: Trang chủ & Đổi Server */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="flex flex-col items-center gap-1 hover:text-blue-400 transition-colors">
              <span className="text-lg">🏠</span>
              <span className="hidden sm:inline">Trang Chủ</span>
            </Link>
            <button onClick={() => window.location.reload()} className="flex flex-col items-center gap-1 hover:text-blue-400 transition-colors">
              <span className="text-lg">⚙️</span>
              <span className="hidden sm:inline">Server</span>
            </button>
          </div>

          {/* Nhóm ở giữa: Đã lược bỏ 2 nút mũi tên thừa, chỉ giữ lại hộp chuyển chương thông minh */}
          <div className="relative z-[60]">
             <ChapterNavigation 
                chapters={chapters} 
                currentSoChuong={currentSoChuong} 
                slug={slug}
                truyenId={truyenId} 
             />
          </div>

          {/* Nhóm nút bên phải: Báo lỗi & Theo dõi truyện */}
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setIsOpenReport(true)} className="flex flex-col items-center gap-1 hover:text-red-400 transition-colors">
              <span className="text-lg">⚠️</span>
              <span className="hidden sm:inline">Báo Lỗi</span>
            </button>

            <button 
              onClick={handleTheoDoi} 
              disabled={isSubmitting}
              className={`flex flex-col items-center gap-1 transition-colors ${isSubmitting ? 'opacity-50' : 'hover:text-yellow-400'}`}
            >
              <span className="text-lg">{isSubmitting ? "⏳" : "🔖"}</span>
              <span className="hidden sm:inline">{isSubmitting ? "Đang lưu..." : "Theo Dõi"}</span>
            </button>
          </div>

        </div>
      </div>

      {isOpenReport && (
        <BaoLoiModal chuongId={currentChapterId} onClose={() => setIsOpenReport(false)} />
      )}
    </>
  );
}