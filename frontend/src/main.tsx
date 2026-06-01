import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/lib/react-query';

// Suppress Recharts and react-beautiful-dnd false positive warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string') {
    if (args[0].includes('The width(') && args[0].includes('and height(')) return;
    if (args[0].includes('unsupported nested scroll container detected')) return;
  }
  originalConsoleWarn(...args);
};

// Bỏ qua lỗi promise unhandled từ y-websocket khi component unmount
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.msg === 'operation is manually canceled') {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);