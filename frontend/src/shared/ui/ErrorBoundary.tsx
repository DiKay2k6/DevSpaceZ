import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Cập nhật state để lần render tiếp theo sẽ hiển thị UI fallback
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Đã xảy ra lỗi hệ thống (Crash)!</h2>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4 text-center max-w-lg">
            Hệ thống phát hiện một lỗi trong quá trình hiển thị giao diện. Dưới đây là chi tiết lỗi:
          </p>
          <div className="bg-white dark:bg-[#0B0F19] p-4 rounded-lg border border-red-200 dark:border-red-900/50 w-full max-w-3xl overflow-auto max-h-[300px]">
            <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
