export const getAvatarUrl = (url: string | undefined | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Fallback: nếu url là relative path (bắt đầu bằng /)
    const baseURL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : '';
    
    let path = url;
    // Nếu chỉ là tên file (không có dấu /), tự động thêm /uploads/avatars/
    if (!url.includes('/')) {
        path = `/uploads/avatars/${url}`;
    } else if (!url.startsWith('/')) {
        path = `/${url}`;
    }
    
    return `${baseURL}${path}`;
};
