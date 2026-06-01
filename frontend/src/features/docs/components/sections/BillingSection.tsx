import React from 'react';

export const BillingSection: React.FC = () => (
    <article className="max-w-4xl">
        <div className="text-blue-500 font-bold text-sm mb-4">Documentation / Thanh toán</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">Tích hợp Webhook MoMo</h1>
        <p className="text-lg leading-relaxed mb-8 transition-colors duration-300 text-slate-600 dark:text-slate-400">
            Tìm hiểu cách hệ thống DevSpacez tự động duyệt gói Pro ngay khi người dùng quét mã QR thông qua cơ chế Webhook & Cron Job dự phòng.
        </p>

        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Luồng xử lý (Payment Flow)</h3>
                <ol className="relative border-l border-slate-200 dark:border-slate-500/20 ml-3 space-y-8">
                    <li className="pl-6">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] top-2 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                        <h4 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">Bước 1: Nhận IPN từ MoMo</h4>
                        <p className="text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400">
                            Khi thanh toán thành công trên App MoMo, máy chủ MoMo gửi một HTTP POST Request (IPN) chứa chuỗi mã hóa HMAC SHA256 về API của DevSpace. Hệ thống xác thực chữ ký và duyệt gói Pro ngay lập tức.
                        </p>
                    </li>
                    <li className="pl-6">
                        <div className="absolute w-3 h-3 bg-orange-500 rounded-full -left-[6.5px] top-2 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
                        <h4 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">Bước 2: Xử lý ngoại lệ (Cron Job)</h4>
                        <p className="text-sm mb-3 transition-colors duration-300 text-slate-600 dark:text-slate-400">
                            Nếu xảy ra rớt mạng lúc MoMo gửi Webhook, giao dịch sẽ bị kẹt ở trạng thái "Pending". Hệ thống thiết lập sẵn một <strong className="text-slate-800 dark:text-slate-200">Cron Job chạy ngầm mỗi 15 phút</strong> để tự động truy vấn lại API của MoMo và khắc phục sự cố.
                        </p>
                    </li>
                </ol>
            </div>

            <div className="p-6 rounded-2xl transition-colors duration-300 bg-slate-100 dark:bg-[#05070A] border border-transparent dark:border-slate-800">
                <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-slate-500">Mẫu Payload IPN MoMo gửi về:</h3>
                <pre className="font-mono text-xs overflow-x-auto transition-colors duration-300 text-slate-800 dark:text-slate-300">
                    {`{
  "partnerCode": "MOMOVLU2026",
  "orderId": "PRO_PKG_9921",
  "requestId": "REQ_9921",
  "amount": 799000,
  "orderInfo": "Nang cap DevSpacez Pro - 1 Nam",
  "orderType": "momo_wallet",
  "transId": 2938472918,
  "resultCode": 0,
  "message": "Successful.",
  "payType": "qr",
  "signature": "a8c9b3... (HMAC SHA256 hash)"
}`}
                </pre>
            </div>
        </div>
    </article>
);