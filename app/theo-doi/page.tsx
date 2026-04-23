import { prisma } from "../../lib/prisma";
import Header from "../components/Header"; // Sửa lại đường dẫn import cho đúng cấu trúc folder của ông
import ComicCard from "../components/ComicCard";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function TheoDoiPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const followedItems = await prisma.theoDoi.findMany({
    where: { 
      nguoiDungId: (session.user as any).id 
    }, 
    include: { 
      truyen: {
        include: {
          // Nếu database của ông là 'chuong' thì để 'chuong', nếu là 'chuongs' thì giữ nguyên nhé
          chuongs: {
            orderBy: { soChuong: 'desc' },
            take: 1
          }
        }
      } 
    },
    orderBy: { ngayTheoDoi: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Header />
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          <h2 className="text-3xl font-extrabold uppercase tracking-tight">Truyện Đang Theo Dõi</h2>
        </div>

        {followedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {followedItems.map((item: any) => (
              <ComicCard key={item.id} comic={item.truyen} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 rounded-3xl bg-[#161b22] border border-dashed border-gray-700">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-400 text-lg">Ông chưa theo dõi bộ nào hết!</p>
          </div>
        )}
      </div>
    </main>
  );
}