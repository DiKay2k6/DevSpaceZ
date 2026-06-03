# Hướng dẫn thiết lập GitHub Webhook cho Git Intelligence

Tài liệu này hướng dẫn bạn cách kết nối kho lưu trữ (Repository) hoặc Tổ chức (Organization) trên GitHub với hệ thống DevSpaceZ để tự động cập nhật thống kê Code (Commits, Pull Requests).

## Bước 1: Tạo Webhook Secret
Webhook Secret giống như một mật khẩu để GitHub chứng minh với Server của chúng ta rằng: "Dữ liệu này thực sự do GitHub gửi, không phải do hacker gửi giả mạo".

1. Bạn có thể tự bịa ra một chuỗi Secret bất kỳ (ví dụ: `my_super_secret_devspacez_2026`) hoặc tạo một chuỗi ngẫu nhiên bảo mật bằng lệnh sau trên terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Mở file `.env` của thư mục `backend`, thêm dòng sau:
   ```env
   GITHUB_WEBHOOK_SECRET=chuỗi_secret_bạn_vừa_tạo
   ```
3. Khởi động lại Backend server để nhận biến môi trường mới.

## Bước 2: Cài đặt Webhook trên GitHub
1. Mở Repository của bạn trên GitHub (hoặc trang quản lý Organization nếu muốn tracking toàn bộ các repo trong công ty).
2. Chuyển sang tab **Settings** > Chọn mục **Webhooks** ở menu bên trái.
3. Bấm nút **Add webhook**.
4. Điền các thông tin sau:
   - **Payload URL**: Điền đường dẫn API của Server bạn. Ví dụ: `https://api.devspacez.com/api/v1/git/webhook` (Thay thế bằng domain thật của bạn hoặc dùng ngrok nếu đang chạy localhost).
   - **Content type**: Bắt buộc chọn `application/json`.
   - **Secret**: Dán chuỗi Secret bạn đã tạo ở Bước 1 vào đây.
   - **Which events would you like to trigger this webhook?**: Chọn `Let me select individual events.`.
   - Đánh dấu (Check) vào 2 ô: **Pushes** và **Pull requests**. (Bỏ check tất cả các ô khác để tránh rác server).
   - Đảm bảo ô **Active** đang được bật.
5. Bấm **Add webhook**.

## Bước 3: Kiểm tra (Verify)
Ngay sau khi bấm Add, GitHub sẽ gửi một request Ping (thử nghiệm) tới Server của bạn. 
Nếu bạn thấy dòng log `[GitWorker] Job <id> completed successfully` trên Terminal của backend và có một dấu tick xanh (✔️) xuất hiện bên cạnh Payload URL trên GitHub, nghĩa là bạn đã thiết lập hoàn hảo!

Từ giờ trở đi, mỗi khi có ai đó push code hoặc merge PR, Dashboard của họ trên DevSpaceZ sẽ nhảy số ngay lập tức.
