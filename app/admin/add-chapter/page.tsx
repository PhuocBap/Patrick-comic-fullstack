"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";

function AddChapterForm() {
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ soChuong: "", tenChuong: "", noiDung: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyId) return alert("Thiếu ID truyện!");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/chapters-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          truyenId: Number(storyId), 
          soChuong: Number(formData.soChuong)
        }),
      });

      if (res.ok) {
        alert("Thêm thành công!");
        router.push(`/id-story/${storyId}`);
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.error}`);
      }
    } catch (error) {
      alert("Lỗi kết nối server!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl text-white">
      <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter">Thêm chương mới</h1>
      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-8 rounded-3xl border border-gray-700 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Số chương" className="bg-gray-900 p-3 rounded-xl border border-gray-700" 
                 onChange={(e) => setFormData({...formData, soChuong: e.target.value})} required />
          <input type="text" placeholder="Tên chương" className="bg-gray-900 p-3 rounded-xl border border-gray-700" 
                 onChange={(e) => setFormData({...formData, tenChuong: e.target.value})} />
        </div>
        <textarea rows={10} placeholder="Link ảnh (mỗi dòng 1 link)" className="w-full bg-gray-900 p-3 rounded-xl border border-gray-700 font-mono text-xs" 
                  onChange={(e) => setFormData({...formData, noiDung: e.target.value})} required />
        <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 py-4 rounded-2xl font-black">
          {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN THÊM"}
        </button>
      </form>
    </div>
  );
}

export default function AddChapterPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <Suspense fallback={<div className="text-center py-20 text-white">Đang tải form...</div>}>
        <AddChapterForm />
      </Suspense>
    </div>
  );
}