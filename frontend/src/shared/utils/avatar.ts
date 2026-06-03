export const getAvatarUrl = (url: string | undefined | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Sử dụng relative path /api/v1 khi ở production để Vercel Proxy xử lý (fix CORS & Safari ITP)
    const baseURL = import.meta.env.MODE === 'development' 
        ? (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : '')
        : '';
    
    let path = url;
    // Nếu chỉ là tên file (không có dấu /), tự động thêm /uploads/avatars/
    if (!url.includes('/')) {
        path = `/uploads/avatars/${url}`;
    } else if (!url.startsWith('/')) {
        path = `/${url}`;
    }
    
    return `${baseURL}${path}`;
};
