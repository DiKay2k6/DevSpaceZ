export const PRICING_CONFIG = {
    monthly: 99000,
    yearly: 799000,
};

// Tự động tính toán phần trăm giảm giá
export const DISCOUNT_PERCENT = Math.round(
    (1 - PRICING_CONFIG.yearly / (PRICING_CONFIG.monthly * 12)) * 100
);

// Hàm format tiền tệ (Ví dụ: 99000 -> 99.000)
export const formatPrice = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};