# Tiêu Chuẩn & Nguyên Tắc Phát Triển Ứng Dụng Web (Web Development Rules)

Tài liệu này định nghĩa các nguyên tắc cốt lõi, kiến trúc và tiêu chuẩn code để đảm bảo ứng dụng web đạt hiệu suất cao, dễ bảo trì, và đáp ứng tiêu chuẩn Enterprise (doanh nghiệp).

## 1. Nguyên Tắc Cốt Lõi (Core Principles)
- **Clean Code (Mã sạch):** Viết code cho người đọc, không chỉ cho máy. Sử dụng tên biến có ý nghĩa, hàm ngắn gọn (mỗi hàm chỉ làm 1 việc), comment giải thích "tại sao" (why) chứ không phải "cái gì" (what).
- **SOLID & DRY (Don't Repeat Yourself):** Tuân thủ thiết kế hướng đối tượng hoặc nguyên lý functional. Tuyệt đối tránh copy-paste code; hãy tách thành hàm, component hoặc service dùng chung.
- **KISS (Keep It Simple, Stupid) & YAGNI (You Aren't Gonna Need It):** Đừng làm phức tạp hóa vấn đề. Chỉ lập trình những gì đang thực sự cần thiết trong hiện tại, không over-engineering.

## 2. Tiêu Chuẩn Kiến Trúc (Architecture Standards)

### Kiến Trúc Frontend (Front-End)
*Áp dụng phổ biến cho React, Vue, Angular, Next.js, Nuxt.js*
- **Tổ chức thư mục (Folder Structure):** Ưu tiên **Feature-Sliced Design (FSD)** hoặc **Atomic Design**. Tổ chức theo module/tính năng thay vì theo loại file (gộp chung UI, logic, API của cùng một tính năng vào một chỗ) giúp dự án scale lớn dễ quản lý hơn.
- **State Management (Quản lý trạng thái):**
  - **Local State:** Dùng cho UI component (`useState`, `useReducer`).
  - **Server State (API Data):** Dùng React Query / SWR để quản lý data từ API (xử lý caching, re-fetching, loading state tự động).
  - **Global State:** Redux Toolkit, Zustand hoặc Pinia. **Chỉ dùng** khi state thực sự cần chia sẻ xuyên suốt toàn bộ app (ví dụ: thông tin user đăng nhập, theme, giỏ hàng).
- **Rendering Strategy:** Tận dụng SSR (Server-Side Rendering) hoặc SSG (Static Site Generation) đối với Next.js/Nuxt.js để tối ưu SEO và thời gian hiển thị nội dung đầu tiên (First Contentful Paint).

### Kiến Trúc Backend (Back-End)
*Áp dụng phổ biến cho Node.js, Spring Boot, Go, .NET, Python*
- **Kiến trúc tổng thể:**
  - Ưu tiên **Modular Monolith** hoặc **Clean Architecture / Onion Architecture** cho dự án từ đầu để logic nghiệp vụ (Core Domain) không bị phụ thuộc vào Framework, Database hay UI. Dễ dàng bóc tách ra Microservices khi scale.
  - Chia layer rõ ràng (Layered Architecture): `Controllers/Routers` (Xử lý HTTP) -> `Services/Use Cases` (Logic nghiệp vụ) -> `Repositories/DAOs` (Tương tác Database).
- **API Design:** Xây dựng RESTful API chuẩn mực (sử dụng danh từ số nhiều, HTTP methods chuẩn: GET, POST, PUT, PATCH, DELETE) hoặc dùng GraphQL nếu dữ liệu trả về cần sự linh hoạt lớn từ phía Client.
- **Security (Bảo mật):**
  - **Luôn Validate Input:** Không bao giờ tin tưởng dữ liệu từ client. Sử dụng thư viện (Zod, Joi, Class-validator) để check strict types.
  - Phòng chống tấn công: Cấu hình Rate limiting, CORS, Helmet (chống XSS, Clickjacking).
  - Authentication & Authorization: Sử dụng JWT (có Refresh Token an toàn) hoặc Session-based auth. Phân quyền chặt chẽ (RBAC hoặc ABAC).

### Cơ Sở Dữ Liệu (Database)
- **RDBMS (PostgreSQL, MySQL):**
  - Chuẩn hóa (Normalization) dữ liệu (ít nhất đạt chuẩn 3NF) để tránh dị thường dữ liệu.
  - **Đánh Index (B-Tree, Hash):** Bắt buộc đánh Index cho các cột hay được dùng trong mệnh đề `WHERE`, `JOIN`, `ORDER BY`. Không lạm dụng Index vì làm chậm quá trình Ghi (INSERT/UPDATE).
- **NoSQL (MongoDB, DynamoDB):** Sử dụng khi schema linh hoạt hoặc hệ thống nặng về đọc (read-heavy), dữ liệu có cấu trúc Document. Hạn chế thiết kế đòi hỏi phải join (aggregate) nhiều bảng ở runtime.
- **Caching:** Sử dụng **Redis / Memcached** để lưu trữ cache các câu query phức tạp, session, thông tin cấu hình hoặc rate limit. Cần có chiến lược Cache Invalidation rõ ràng (khi nào cần xóa cache).

## 3. Tối Ưu Hiệu Suất (Performance Optimization)
- **Frontend:**
  - Áp dụng Code splitting, Lazy loading cho images/components và các thư viện nặng.
  - Minify CSS/JS/HTML. Sử dụng định dạng ảnh hiện đại (WebP, AVIF) thay cho JPEG/PNG.
  - Hạn chế re-render không cần thiết (sử dụng `useMemo`, `useCallback` đúng lúc).
- **Backend:**
  - Sử dụng Phân trang (Pagination - Offset hoặc Cursor-based) cho các danh sách lớn.
  - Đẩy các tác vụ nặng, mất thời gian (gửi email, xử lý ảnh, tạo report) ra **Background Jobs / Message Queues** (RabbitMQ, BullMQ, Kafka, AWS SQS) để không block HTTP request chính.
- **Hạ tầng (Network/Infra):** Bật Gzip/Brotli compression ở Server. Sử dụng CDN (Content Delivery Network) để phân phối static assets.
- **Database:** Sử dụng `EXPLAIN` / `ANALYZE` để phân tích query chậm. Giới hạn triệt để lỗi **N+1 Query** bằng kỹ thuật Dataloader, Eager Loading (thường gặp khi dùng ORM).

## 4. Quy Chuẩn Làm Việc & Code (Coding Conventions)
- **Linting & Formatting:** Bắt buộc cài đặt **ESLint + Prettier**. Cấu hình chạy pre-commit hook (sử dụng Husky & lint-staged) để không cho phép commit code bị lỗi cú pháp hoặc sai format lên Git.
- **Git Flow:** Quản lý branch theo chuẩn (vd: `main` cho production, `develop` cho staging, `feature/tên-tính-năng`, `bugfix/tên-lỗi`).
- **Commit Message:** Áp dụng **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`) để history rõ ràng, tự động sinh changelog.
- **Testing:** Viết Unit Test (Jest, Vitest, JUnit) cho core logic nghiệp vụ phức tạp. Integration Test cho API endpoints. E2E Test (Cypress, Playwright) cho các luồng critical nhất của user.
