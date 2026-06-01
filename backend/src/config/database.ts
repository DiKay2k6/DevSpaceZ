import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error("MONGO_URI is not defined in .env file");
        }

        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${(error as Error).message}`);
        // Dừng server nếu không kết nối được Database
        process.exit(1);
    }
};