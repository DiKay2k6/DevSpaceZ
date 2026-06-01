# Kế Hoạch Nâng Cấp DevSpaceZ WebIDE

Tôi đã nhận được toàn bộ các yêu cầu của bạn. Có 3 vấn đề lớn cần giải quyết triệt để trong phiên bản này:

## 1. Nâng cấp Hệ thống Tự Động Sinh Code (Boilerplate Generator) Đẳng Cấp Pro
Giống hệt như Android Studio hay IntelliJ, chúng ta sẽ mở rộng các Option khởi tạo dự án để đáp ứng nhu cầu thực tế của lập trình viên:

**Các Option mới trong Menu Tạo Dự Án:**
1. **React + Vite (JavaScript):** Setup chuẩn Vite (có `index.html`, `vite.config.js`, `src/App.jsx`, `src/main.jsx`).
2. **React + Vite (TypeScript):** Setup chuẩn TypeScript (có `tsconfig.json`, `src/App.tsx`, `src/main.tsx`).
3. **Backend Node.js (Express):** Setup chuẩn REST API (có `package.json`, `index.js`, thư mục `routes/`, `controllers/`).
4. **Fullstack Web (React + Express):** Tích hợp cả Frontend và Backend vào 2 thư mục con riêng biệt.
5. **Java (Console App):** Setup chuẩn Java có hàm Main.
6. **Python (Console App):** Setup chuẩn Python.

*Đặc biệt: Tất cả các file sinh ra đều chứa cấu trúc mã nguồn hoàn thiện, không bị trống.*

## 2. Giải Quyết Lỗi "File Trống Không Hiển Thị"
Lý do một số file Vite (như `vite.config.ts`, `eslint.config.js`) click vào nhưng không hiển thị nội dung là vì có khả năng đường dẫn của WebContainer bị lệch hoặc quá trình nạp File System (VFS) đọc file bị lỗi bộ nhớ khi gặp các tệp đặc biệt.
- **Giải pháp:** Bổ sung cơ chế Debug và đọc lại file `file.text()` dự phòng trực tiếp từ ổ cứng Local Disk nếu WebContainer không trả về dữ liệu.

## 3. Khắc Phục Khó Khăn Với Terminal & npm install
- **Vấn đề:** Khi mở dự án Fullstack, Terminal trỏ vào thư mục Gốc (`~`), khiến lệnh `npm install` bị báo lỗi không tìm thấy `package.json`.
- **Giải pháp:** Hiển thị hướng dẫn trực tiếp lên Terminal khi khởi tạo xong WebContainer: Nhắc nhở người dùng gõ `cd frontend` hoặc `cd backend` trước khi chạy `npm install`.

## 4. Về Câu Hỏi Cơ Sở Dữ Liệu (MongoDB)
- WebIDE **CÓ THỂ** kết nối tới MongoDB hoặc các cơ sở dữ liệu đám mây (như MongoDB Atlas, Supabase, Firebase) thông qua REST API hoặc trình điều khiển Mongoose. 
- Tuy nhiên, vì WebContainer chạy trên trình duyệt, nó không thể cài đặt phần mềm máy chủ MongoDB cục bộ (`mongod`) trực tiếp trong nó được. Bạn phải dùng Cloud Database và điền chuỗi kết nối (Connection String URI).

Bạn có đồng ý với kế hoạch thiết kế và các Boilerplate mới này không? Nếu đồng ý, tôi sẽ tiến hành viết code cho toàn bộ các Template trên ngay lập tức!
