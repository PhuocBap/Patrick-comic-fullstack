"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminUsers() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 1. CHỨC NĂNG ĐỔI QUYỀN (GIỮ NGUYÊN)
  const changeRole = async (userId: string, currentRole: string) => {
    if (userId === (session?.user as any)?.id) return alert("Không thể tự đổi quyền mình!");
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    
    if (!confirm(`Đổi quyền user này thành ${newRole}?`)) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, vaiTro: newRole } : u));
      }
    } catch (error) { alert("Lỗi kết nối!"); }
  };

  // 2. CHỨC NĂNG KHÓA / MỞ KHÓA TÀI KHOẢN
  const toggleBlockUser = async (userId: string, isBlocked: boolean) => {
    if (userId === (session?.user as any)?.id) return alert("Không thể tự khóa chính mình!");
    const actionText = isBlocked ? "Mở khóa" : "Khóa";
    
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này không?`)) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !isBlocked })
      });

      if (res.ok) {
        alert(`${actionText} tài khoản thành công!`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !isBlocked } : u));
      } else {
        alert("Thực hiện thất bại!");
      }
    } catch (error) { alert("Lỗi kết nối!"); }
  };

  // 3. CHỨC NĂNG XÓA TÀI KHOẢN
  const deleteUser = async (userId: string) => {
    if (userId === (session?.user as any)?.id) return alert("Không thể tự xóa chính mình!");
    
    if (!confirm("CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN user này? Hành động này không thể hoàn tác!")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert("Đã xóa tài khoản thành công!");
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert("Không thể xóa user này!");
      }
    } catch (error) { alert("Lỗi kết nối!"); }
  };

  if (loading) return <div className="p-10 text-white italic">Đang tải...</div>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">QUẢN LÝ USER</h1>
      <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1a1a1a] text-gray-400 text-[10px] uppercase">
            <tr>
              <th className="p-4">Username</th>
              <th className="p-4">Role</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-t border-gray-800 hover:bg-white/5 transition-colors">
                <td className="p-4">{u.tenDangNhap}</td>
                <td className="p-4">
                  <span className={u.vaiTro === 'ADMIN' ? 'text-blue-500 font-bold' : 'text-gray-500'}>
                    {u.vaiTro}
                  </span>
                </td>
                <td className="p-4">
                  {u.isBlocked ? (
                    <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-xs border border-red-500/20">Đã khóa</span>
                  ) : (
                    <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-xs border border-green-500/20">Hoạt động</span>
                  )}
                </td>
                <td className="p-4 flex gap-2 justify-center">
                  <button 
                    onClick={() => changeRole(u.id, u.vaiTro)} 
                    className="text-xs border border-gray-700 px-3 py-1 rounded hover:bg-blue-600 hover:border-blue-600 transition-all"
                  >
                    Quyền
                  </button>
                  <button 
                    onClick={() => toggleBlockUser(u.id, u.isBlocked)} 
                    className={`text-xs border px-3 py-1 rounded transition-all ${
                      u.isBlocked 
                        ? 'border-green-700 hover:bg-green-600' 
                        : 'border-yellow-700 hover:bg-yellow-600'
                    }`}
                  >
                    {u.isBlocked ? "Mở khóa" : "Khóa"}
                  </button>
                  <button 
                    onClick={() => deleteUser(u.id)} 
                    className="text-xs border border-red-900 px-3 py-1 rounded bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white transition-all"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}