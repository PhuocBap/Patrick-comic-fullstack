function getRelativeTime(dateString: string): string {
  if (!dateString) return "vừa xong";
  
  const now = new Date();
  const updated = new Date(dateString);
  
  if (isNaN(updated.getTime())) return "vừa xong";

  const diffInSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000);

  if (diffInSeconds < 60) return "vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  
  return updated.toLocaleDateString('vi-VN');
}