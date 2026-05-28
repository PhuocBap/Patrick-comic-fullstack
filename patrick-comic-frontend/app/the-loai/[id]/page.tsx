"use client";
import { useEffect, useState, use } from "react";
import ComicCard from "../../components/ComicCard";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { notFound } from "next/navigation";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export default function TheLoaiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [theLoai, setTheLoai] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheLoai = async () => {
      try {
        const res = await fetch(`${backendUrl}/the-loai/${id}`);
        if (!res.ok) return setTheLoai(null);
        const data = await res.json();
        setTheLoai(data);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTheLoai();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!theLoai) return notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="mb-10 bg-[#121212] p-6 rounded-[2rem] border border-gray-800 flex items-center gap-4">
          <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
          <h1 className="text-2xl md:text-4xl font-black uppercase">
            Thể loại: <span className="text-blue-500">{theLoai.ten}</span>
          </h1>
        </div>

        {theLoai.truyens?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {theLoai.truyens.map((comic: any) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-[#121212] rounded-[2rem] border border-dashed border-gray-800">
            <p className="text-gray-500 font-bold uppercase">Chưa có truyện nào!</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}