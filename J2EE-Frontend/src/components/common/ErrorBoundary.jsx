import React from 'react';

// Nhận diện lỗi tải chunk lazy (stale hash sau deploy, mạng/525) để xử lý phù hợp.
const CHUNK_ERROR_RE = /(loading chunk|dynamically imported|module script|failed to fetch|networkerror|cannot find module|error loading|preload)/i;

/**
 * Error Boundary component để bắt và xử lý lỗi trong React component tree
 * Giúp ứng dụng không bị crash hoàn toàn khi có lỗi xảy ra
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    const text = `${error?.message || ''} ${errorInfo?.componentStack || ''}`;
    this.setState({ errorInfo, isChunkError: CHUNK_ERROR_RE.test(text) });
  }

  handleReset = () => {
    // Chunk lazy lỗi không thể phục hồi bằng cách re-render: import vẫn bị reject.
    // Tải lại trang để trình duyệt lấy build mới (và chunk hash mới).
    if (this.state.isChunkError) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null, errorInfo: null, isChunkError: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Đã xảy ra lỗi
            </h2>
            <p className="text-gray-600 mb-6">
              Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng thử lại.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Chi tiết lỗi (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  <p className="font-semibold text-red-600">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="mt-2 text-gray-700">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Thử lại
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
