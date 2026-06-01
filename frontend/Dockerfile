# ==========================================
# STAGE 1: Build React App
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy các thư mục cần thiết
COPY frontend/ ./frontend/
COPY shared/ ./shared/

WORKDIR /app/frontend

# Cài đặt dependencies
RUN npm install

# Build ứng dụng Vite
RUN npm run build

# ==========================================
# STAGE 2: Serve với Nginx
# ==========================================
FROM nginx:alpine

# Xóa default config của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy file build từ Stage 1
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy Nginx config tùy chỉnh để hỗ trợ React Router (SPA)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
