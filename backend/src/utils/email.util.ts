import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"DevSpacez" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log(`📧 Đã gửi email thành công tới: ${to}`);
    } catch (error) {
        console.error(`❌ Lỗi gửi email: ${(error as Error).message}`);
        console.log('💡 TIP: Hãy kiểm tra cấu hình EMAIL_USER và EMAIL_PASS trong file .env');
    }
};