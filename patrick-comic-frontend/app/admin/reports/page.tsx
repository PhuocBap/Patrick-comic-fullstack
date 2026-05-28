"use client";
import { useEffect, useState } from "react";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reports/admin/all`);
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error("Lỗi fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleResolved = async (id: string) => {
    if (!confirm("Đã sửa xong lỗi này và muốn xóa báo cáo?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reports/${id}`, { method: "DELETE" });
      setReports(reports.filter((r: any) => r.id !== id));
    } catch (error) {
      alert("Lỗi xử lý!");
    }
  };

  if (loading) return <div className="p-6 text-white">Đang check lỗi...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6 text-yellow-500">DANH SÁCH BÁO LỖI</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r: any) => (
          <div key={r.id} className="bg-[#111] border border-gray-800 p-5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded uppercase">
                  {r.loaiLoi}
                </span>
                <span className="text-gray-500 text-xs">ID: {r.id.slice(0,8)}</span>
              </div>
              <h3 className="font-bold text-lg text-blue-400">
                {r.chuong?.truyen?.tenTruyen || "N/A"}
              </h3>
              <p className="text-sm text-gray-400 mb-3">Chương số: {r.chuong?.soChuong}</p>
              <div className="bg-[#1a1a1a] p-3 rounded text-sm italic text-gray-300">
                "{r.moTa || "Không có mô tả chi tiết"}"
              </div>
            </div>
            <button 
              onClick={() => handleResolved(r.id)}
              className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
            >
              Đã xử lý
            </button>
          </div>
        ))}
      </div>
      {reports.length === 0 && <p className="text-gray-500 italic">Hiện tại không có báo lỗi nào.</p>}
    </div>
  );
}