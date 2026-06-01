import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis successfully'));

export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('⚠️ Không thể kết nối Redis, sẽ bỏ qua Cache:', error);
    }
};

export const cacheService = {
    /**
     * Lấy dữ liệu từ Cache
     */
    get: async (key: string): Promise<any | null> => {
        try {
            const data = await redisClient.get(key);
            if (data) return JSON.parse(data);
            return null;
        } catch (error) {
            console.error(`Lỗi lấy cache Redis (${key}):`, error);
            return null;
        }
    },

    /**
     * Lưu dữ liệu vào Cache
     * @param key Từ khóa
     * @param data Dữ liệu cần lưu
     * @param ttl Thời gian sống (giây). Mặc định 1 giờ.
     */
    set: async (key: string, data: any, ttl: number = 3600): Promise<void> => {
        try {
            await redisClient.setEx(key, ttl, JSON.stringify(data));
        } catch (error) {
            console.error(`Lỗi lưu cache Redis (${key}):`, error);
        }
    },

    /**
     * Xóa Cache theo Key
     */
    del: async (key: string): Promise<void> => {
        try {
            await redisClient.del(key);
        } catch (error) {
            console.error(`Lỗi xóa cache Redis (${key}):`, error);
        }
    },

    /**
     * Xóa nhiều Cache theo pattern (ví dụ xóa toàn bộ cache liên quan đến 1 board)
     */
    delByPattern: async (pattern: string): Promise<void> => {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
        } catch (error) {
            console.error(`Lỗi xóa cache theo pattern Redis (${pattern}):`, error);
        }
    }
};

export default redisClient;
