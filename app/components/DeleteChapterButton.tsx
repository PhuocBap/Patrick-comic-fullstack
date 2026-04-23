"use client";

export default function DeleteChapterButton({ chapterId }: { chapterId: number }) {
  const handleDelete = async () => {
    if (confirm("Ông có chắc muốn xóa vĩnh viễn chương này?")) {
      const res = await fetch(`/api/chapters/${chapterId}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Xóa thành công!");
        window.location.reload();
      } else {
        alert("Lỗi khi xóa!");
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="p-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors text-xs"
    >
      XÓA
    </button>
  );
}