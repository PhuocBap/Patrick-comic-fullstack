"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link"; 

// ========================================================
// 1. COMPONENT CON: Chứa toàn bộ logic xử lý dữ liệu và giao diện chính
// ========================================================
function AdminCommentsContent() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const chuongId = searchParams.get("chuongId");
  const truyenId = searchParams.get("truyenId");
const fetchComments = async () => {
    try {
      let queryParams = [];
      if (chuongId) queryParams.push(`chuongId=${chuongId}`);
      if (truyenId) queryParams.push(`truyenId=${truyenId}`);
      
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/admin/all`;
      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }

      const res = await fetch(url);
      const result = await res.json();
      
      // 🎯 TỐI ƯU & FIX LỖI: Kiểm tra nếu có result.data thì lấy mảng, không thì dùng fallback mảng rỗng
      if (res.ok) {
        setComments(result.data || (Array.isArray(result) ? result : []));
      } else {
        setComments([]);
      }
    } catch (error) { 
      console.error("Lỗi:", error);
      setComments([]); // Fallback mảng rỗng phòng khi lỗi kết nối mạng
    } finally { 
      setLoading(false); 
    }
  };
  useEffect(() => { 
    fetchComments(); 
  }, [chuongId, truyenId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bình luận này?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${id}`, { method: "DELETE" });
      if (res.ok) setComments(comments.filter((c: any) => c.id !== id));
    } catch (error) { 
      alert("Lỗi khi xóa!"); 
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Đang tải bình luận...</div>;

  // Toàn bộ giao diện hiển thị table được đưa vào ĐÚNG trong component này
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          Quản lý Bình luận {(chuongId || truyenId) && <span className="text-sm font-normal text-gray-400">(Đang áp dụng bộ lọc)</span>}
        </h1>
        <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
          {comments.length} Comments
        </span>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1a1a1a] text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-4 w-1/4">Thành viên</th>
              <th className="p-4 w-2/3">Nội dung</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {comments.map((c: any) => (
              <tr key={c.id} className="hover:bg-[#151515] transition">
                <td className="p-4 font-bold text-blue-400">{c.nguoiDung?.tenDangNhap || "Ẩn danh"}</td>
                <td className="p-4">
                  <div className="text-gray-300 italic">"{c.noiDung}"</div>
                  
                  {/* ZONE TAG HIỂN THỊ TÊN TRUYỆN + CHƯƠNG */}
                  {(c.truyen || c.chuong) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {c.truyen?.tenTruyen && (
                        <Link 
                          href={`/id-story/${c.truyen.id || c.truyenId}`} 
                          className="text-[11px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-medium hover:bg-blue-500/30 hover:text-blue-300 transition cursor-pointer"
                          title="Nhấp để xem chi tiết truyện"
                        >
                          {c.truyen.tenTruyen}
                        </Link>
                      )}
                      {c.chuong?.soChuong !== undefined && c.chuong?.soChuong !== null && (
                        <span className="text-[11px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-medium">
                          Chương {c.chuong.soChuong}
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline font-medium">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {comments.length === 0 && (
        <div className="p-8 text-center text-gray-500 italic">Không có bình luận nào được tìm thấy.</div>
      )}
    </div>
  );
}

// ========================================================
// 2. COMPONENT CHA (Export chính): Bọc Suspense chống lỗi Prerender Vercel
// ========================================================
export default function AdminComments() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Đang tải trang quản lý...</div>}>
      <AdminCommentsContent />
    </Suspense>
  );
}