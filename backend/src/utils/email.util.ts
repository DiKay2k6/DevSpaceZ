import { Resend } from 'resend';

// Khởi tạo Resend SDK với API Key từ biến môi trường
// Nếu chưa có (chạy local), sẽ khởi tạo tạm thời để không bị lỗi crash
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('⚠️ CẢNH BÁO: Bạn chưa cấu hình biến môi trường RESEND_API_KEY!');
            console.warn(`📩 Đang giả lập gửi mail (MOCK). Bỏ qua việc gửi thật tới ${to}.`);
            return;
        }

        const { data, error } = await resend.emails.send({
            from: 'DevSpaceZ <onboarding@resend.dev>', // Email mặc định của Resend dùng để test
            to,
            subject,
            html
        });

        if (error) {
            console.error(`❌ Lỗi từ Resend API: ${error.message}`);
            throw new Error(`Resend API Error: ${error.message}`);
        }

        console.log(`📧 Đã gửi email thành công tới: ${to} (ID: ${data?.id})`);
    } catch (error) {
        console.error(`❌ Lỗi gửi email: ${(error as Error).message}`);
        console.log('💡 TIP: Hãy kiểm tra cấu hình RESEND_API_KEY trong file .env trên Render');
        throw error;
    }
};