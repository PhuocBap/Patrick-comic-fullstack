const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getLatestComics = async (page = 1, limit = 12) => {
  if (!API_URL) return { data: [], totalPages: 1 };
  try {
    // Sửa thành /stories cho đồng bộ với Controller
    const res = await fetch(`${API_URL}/stories?page=${page}&limit=${limit}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return { data: [], totalPages: 1 };
    const result = await res.json();
    
    // Trả về 'data' để khớp với logic trong page.tsx
    return { 
      data: result.data || [], 
      totalPages: result.totalPages || 1 
    }; 
  } catch (error) {
    return { data: [], totalPages: 1 };
  }
};

export const getTopStories = async (limit = 10) => {
  if (!API_URL) return [];
  try {
    // Sửa thành /stories/top-viewed cho đúng endpoint
    const res = await fetch(`${API_URL}/stories/top-viewed?limit=${limit}`, {
      next: { revalidate: 3600 } 
    });
    return res.ok ? await res.json() : [];
  } catch (error) {
    return [];
  }
};