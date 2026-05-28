"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

interface FormDataState {
  soChuong: string;
  tenChuong: string;
  urlCrawl: string;
}

function AddChapterForm() {
  const router = useRouter();
  
  // 1️⃣ Chỉ khai báo đúng 1 lần duy nhất để Next.js lắng nghe Search Params đồng bộ
  const searchParams = useSearchParams(); 

  // 2️⃣ Đọc dữ liệu trực tiếp bằng hàm .get() đồng bộ, không cần bọc qua React.use()
  const storyId = searchParams.get("storyId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [crawlMode, setCrawlMode] = useState<"single" | "all">("single");
  
  const [formData, setFormData] = useState<FormDataState>({ 
    soChuong: "", 
    tenChuong: "", 
    urlCrawl: "" 
  });

  const extractChapterNumber = (url: string): string => {
    if (!url) return "";
    const match = url.match(/(?:chuong|chapter)-([0-9]+(?:\.[0-9]+)?)/i);
    return match ? match[1] : "";
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const urlValue = e.target.value;
    
    if (crawlMode === "single") {
      const extractedNumber = extractChapterNumber(urlValue);
      setFormData((prev: FormDataState) => {
        const updated = { ...prev, urlCrawl: urlValue };
        if (extractedNumber && !prev.soChuong) {
          updated.soChuong = extractedNumber;
        }
        return updated;
      });
    } else {
      setFormData((prev) => ({ ...prev, urlCrawl: urlValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyId) return alert("❌ Lỗi: Thiếu ID bộ truyện (storyId) trên URL thanh địa chỉ!");
    if (!formData.urlCrawl.trim()) return alert("❌ Vui lòng cung cấp link cần xử lý!");
    
    setIsSubmitting(true);
    try {
      const endpoint = crawlMode === "single" ? "/chuong/crawl" : "/chuong/crawl-all";
      
      const payload = crawlMode === "single" 
        ? { 
            urlChapter: formData.urlCrawl.trim(), 
            truyenId: Number(storyId), 
            soChuong: formData.soChuong ? Number(formData.soChuong) : undefined,          
            tenChuong: formData.tenChuong ? formData.tenChuong.trim() : "" 
          }
        : {
            urlStory: formData.urlCrawl.trim(), 
            truyenId: Number(storyId)
          };

      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const result = await res.json();
      console.log("[Hệ thống] Kết quả phản hồi cào chương:", result);

      if (res.ok) {
        if (crawlMode === "single") {
          alert("🎉 Cào dữ liệu chương truyện thành công!");
        } else {
          alert(`🎉 Hoàn tất quét toàn bộ! Thêm mới thành công: ${result.successCount || 0} chương. Bỏ qua trùng lặp hoặc lỗi: ${result.failCount || 0} chương.`);
        }
        router.push(`/id-story/${storyId}`);
        router.refresh();
      } else {
        const errorMsg = result?.message || result?.error || "Giao diện trang nguồn có thay đổi hoặc đường link không hợp lệ!";
        alert(`❌ Thất bại từ Server: ${errorMsg}`);
      }
    } catch (error) { 
      console.error("Lỗi kết nối Frontend:", error);
      alert("❌ Thất bại: Không thể kết nối tới máy chủ API Backend!"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl text-white">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.99) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-green-500 rounded-full"></div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Cấu hình cào tự động</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-[#111] p-8 rounded-[2rem] border border-gray-800 space-y-6 shadow-2xl">
        <div>
          <label className="block text-xs text-gray-400 mb-2 ml-1">Chọn chế độ cào dữ liệu:</label>
          <select 
            value={crawlMode} 
            onChange={(e) => setCrawlMode(e.target.value as "single" | "all")}
            className="w-full bg-black p-4 rounded-xl border border-gray-800 focus:border-green-500 outline-none font-bold transition-all text-green-400 cursor-pointer"
          >
            <option value="single">Cào một chương duy nhất (Nhập link chương lẻ)</option>
            <option value="all">Cào TOÀN BỘ danh sách chương (Nhập link tổng bộ truyện)</option>
          </select>
        </div>

        {crawlMode === "single" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div>
              <label className="block text-xs text-gray-500 mb-2 ml-1">Số chương:</label>
              <input 
                type="number" 
                step="any"
                placeholder="Ví dụ: 1 hoặc 2.5" 
                value={formData.soChuong}
                className="w-full bg-black p-4 rounded-xl border border-gray-800 focus:border-green-500 outline-none font-bold transition-all text-white" 
                onChange={(e) => setFormData({...formData, soChuong: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2 ml-1">Tên chương (Tùy chọn):</label>
              <input 
                type="text" 
                placeholder="Ví dụ: Tiết tử, Ngoại truyện" 
                value={formData.tenChuong}
                className="w-full bg-black p-4 rounded-xl border border-gray-800 focus:border-green-500 outline-none font-bold transition-all text-white" 
                onChange={(e) => setFormData({...formData, tenChuong: e.target.value})} 
              />
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-xs text-gray-400 mb-2 ml-1">
            {crawlMode === "single" 
              ? "Nhập đường link chương truyện gốc cần cào dữ liệu:" 
              : "Nhập đường link trang tổng chi tiết của truyện gốc:"
            }
          </label>
          <textarea 
            rows={4} 
            placeholder={crawlMode === "single" 
              ? "Ví dụ: https://blogtruyenmoi.net/tranh-thu-kiem-chac-o-the-gioi-quy-di-thi-lam-sao/chuong-1" 
              : "Ví dụ: https://blogtruyenmoi.net/tranh-thu-kiem-chac-o-the-gioi-quy-di-thi-lam-sao"
            }
            value={formData.urlCrawl}
            className="w-full bg-black p-6 rounded-2xl border border-green-900/50 focus:border-green-500 outline-none font-mono text-sm text-green-400 transition-all placeholder:text-gray-700" 
            onChange={handleUrlChange} 
            required 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-green-600 hover:bg-green-500 py-5 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-green-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? (crawlMode === "single" ? "⏳ ĐANG CÀO DỮ LIỆU CHƯƠNG..." : "⏳ ĐANG QUÉT & CÀO BÙ CHƯƠNG HÀNG LOẠT...") 
            : (crawlMode === "single" ? "🚀 XÁC NHẬN CÀO CHƯƠNG" : "⚡ KÍCH HOẠT CÀO TOÀN BỘ CHƯƠNG")
          }
        </button>
      </form>
    </div>
  );
}

export default function AddChapterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <Suspense fallback={<div className="text-white p-20 text-center font-bold animate-pulse tracking-wide">HỆ THỐNG ĐANG TẢI FORM CẤU HÌNH...</div>}>
        <AddChapterForm />
      </Suspense>
    </div>
  );
}