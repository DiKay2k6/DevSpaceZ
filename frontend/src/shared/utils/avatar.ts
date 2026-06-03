export const getAvatarUrl = (url: string | undefined | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Nếu db lưu dạng relative path /uploads/avatars/...
    // Ta lấy VITE_API_URL (ví dụ: https://devspacez.onrender.com/api/v1)
    // Và bỏ đi /api/v1 để lấy root url
    const baseURL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : '';
    return `${baseURL}${url.startsWith('/') ? url : '/' + url}`;
};
