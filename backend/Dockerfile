# ==========================================
# STAGE 1: Build Image
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy thư mục backend và shared vào app
COPY backend/ ./backend/
COPY shared/ ./shared/

WORKDIR /app/backend

# Cài đặt dependencies cho backend
RUN npm install

# Build Backend (Sẽ compile code từ src/ và ../shared/)
RUN npm run build

# ==========================================
# STAGE 2: Production Image
# ==========================================
FROM node:20-alpine

WORKDIR /app/backend

# Cài đặt curl
RUN apk add --no-cache curl

# Copy các file package
COPY --from=builder /app/backend/package*.json ./

# Cài đặt lại các dependencies (chỉ production)
RUN npm install --omit=dev

# Copy mã nguồn đã được compile
COPY --from=builder /app/backend/dist ./dist

# Tạo thư mục public/uploads
RUN mkdir -p public/uploads

# Expose port
EXPOSE 5001

# Đặt biến môi trường
ENV NODE_ENV=production

# Chạy server
CMD ["node", "dist/backend/src/server.js"]
