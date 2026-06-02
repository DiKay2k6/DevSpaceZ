import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// 1. IMPORT CÁC PROVIDER & STORE
import { ThemeProvider } from './shared/contexts/ThemeContext';
import { useAuthStore } from '@/entities/user/model/authStore'; // <-- Dùng Zustand thay cho AuthContext
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Toaster, toast } from 'react-hot-toast';
import { useSocket } from '@/shared/hooks/useSocket';
// Trigger Vite reload

// Components & Layouts (Cái nào load trước thì giữ nguyên import tĩnh)
import { Navbar } from './components/layout/Navbar/Navbar';
import { Footer } from './components/layout/Footer/Footer';

// Route Guards (Lưới bảo vệ tuyến đường vừa tạo)
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';

// ----------------------------------------------------------------------
// 🚀 TỐI ƯU HIỆU SUẤT (CODE SPLITTING): Áp dụng Lazy Load cho toàn bộ Pages
// ----------------------------------------------------------------------
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout/DashboardLayout'));
const Home = lazy(() => import('./pages/Home'));
const Platform = lazy(() => import('./pages/Platform'));
const Workflows = lazy(() => import('./pages/Workflows'));
const ServerMonitor = lazy(() => import('./pages/ServerMonitor'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Docs = lazy(() => import('./pages/Docs'));
const Support = lazy(() => import('./pages/Support'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AuthCallback = lazy(() => import('./features/auth/components/AuthCallback').then(m => ({ default: m.AuthCallback })));
const SettingsLayout = lazy(() => import('./layouts/SettingsLayout/SettingsLayout'));
const AccountSettings = lazy(() => import('./pages/dashboard/settings/AccountSettings'));
const SecuritySettings = lazy(() => import('./pages/dashboard/settings/SecuritySettings'));
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const KanbanBoard = lazy(() => import('./pages/dashboard/KanbanBoard'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/DashboardAnalytics'));
const Team = lazy(() => import('./pages/dashboard/Team'));
const DashboardDocs = lazy(() => import('./pages/dashboard/Docs'));
const ChatPage = lazy(() => import('./pages/dashboard/ChatPage').then(m => ({ default: m.ChatPage })));
const FullPageIDE = lazy(() => import('./pages/dashboard/FullPageIDE').then(m => ({ default: m.FullPageIDE })));
const DockerMonitor = lazy(() => import('./pages/dashboard/DockerMonitor'));
// ----------------------------------------------------------------------

// Component Loading dùng chung cho Suspense
const SuspenseLoader = () => (
  <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0B0F19] transition-colors duration-300">
    <div className="relative flex items-center justify-center w-12 h-12">
      <div className="absolute inset-0 rounded-xl border-2 border-slate-100 dark:border-slate-800" />
      <div className="absolute inset-0 rounded-xl border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  </div>
);

// Layout Public (Có Navbar và Footer)
const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-white dark:bg-[#111520] text-slate-900 dark:text-white transition-colors duration-300">
    <Navbar />
    <div className="flex-1"><Outlet /></div>
    <Footer />
  </div>
);

const App: React.FC = () => {
  // Lấy hàm kiểm tra đăng nhập ngầm từ Zustand Store
  const { checkAuth, isCheckingAuth } = useAuthStore();

  // Tự động kiểm tra Cookie gửi lên Backend ngay khi ứng dụng khởi chạy
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Khởi tạo Socket.io Global
  useSocket();

  // Trong lúc đợi Backend trả lời Cookie hợp lệ không, hiển thị màn hình Loading
  // Tránh việc chớp nháy giao diện hoặc đẩy nhầm trang
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0B0F19] transition-colors duration-300 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl" />
        
        <div className="flex flex-col items-center gap-6 z-10">
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 rounded-2xl border-2 border-slate-100 dark:border-slate-800" />
            <div className="absolute inset-0 rounded-2xl border-2 border-blue-500 border-t-transparent animate-spin" />
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">
              devspace<span className="text-blue-500">z</span>
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Toaster />
      <Router>
        <Suspense fallback={<SuspenseLoader />}>
          <Routes>

            {/* NHÓM 1: Các trang Public có Header/Footer (Ai cũng vào xem được) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/platform" element={<Platform />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/monitor" element={<ServerMonitor />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/support" element={<Support />} />
            </Route>

            {/* NHÓM 2: Trang Đăng nhập / Đăng ký */}
            {/* Bọc bằng PublicRoute -> Nếu đã login rồi mà lỡ gõ /auth thì đá thẳng vô /dashboard */}
            <Route element={<PublicRoute />}>
              <Route path="/auth" element={<AuthPage />} />
            </Route>
            {/* Callback không bọc bằng PublicRoute để tránh lỗi chớp redirect khi chưa có user */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* NHÓM 3: Trang Quản trị (Dashboard) - DÀNH CHO USER ĐÃ ĐĂNG NHẬP */}
            {/* Bọc bằng ProtectedRoute -> Nếu chưa login mà gõ /dashboard thì đá văng ra /auth */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Overview />} />
                <Route path="monitor" element={<DockerMonitor />} />
                <Route path="team" element={<Team />} />
                <Route path="docs" element={<DashboardDocs />} />
                <Route path="board/:id" element={<KanbanBoard />} />
                <Route path="analytics" element={<DashboardAnalytics />} />
              </Route>

              {/* Tách IDE ra khỏi DashboardLayout để Full-screen */}
              <Route path="/ide" element={<FullPageIDE />} />

              {/* Tách Chat ra khỏi DashboardLayout để Full-screen */}
              <Route path="/dashboard/chat" element={<ChatPage />} />

              {/* NHÓM 3.5: Trang Cài đặt - Full page layout, không bị kẹp bởi Dashboard Sidebar */}
              <Route path="/dashboard/settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="account" replace />} />
                <Route path="account" element={<AccountSettings />} />
                <Route path="security" element={<SecuritySettings />} />
              </Route>
            </Route>

            {/* NHÓM 4: TUYẾN ĐƯỜNG DEMO (Không bảo vệ, dành cho khách vào "Explore Dashboard") */}
              <Route path="/demo" element={<DashboardLayout />}>
              <Route index element={<div className="p-8 text-2xl font-bold text-amber-600 dark:text-amber-500">Bản xem trước: Trang Tổng quan (Dữ liệu không được lưu)</div>} />
              <Route path="analytics" element={<div className="p-8 text-2xl font-bold text-amber-600 dark:text-amber-500">Bản xem trước: Thống kê & Báo cáo</div>} />
              <Route path="settings" element={<div className="p-8 text-2xl font-bold text-amber-600 dark:text-amber-500">Bản xem trước: Cài đặt Hệ thống</div>} />
            </Route>

            {/* Xử lý đường dẫn không hợp lệ (404) -> Trả về trang chủ */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;