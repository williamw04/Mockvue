import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
          <div className="max-w-2xl p-8 bg-gray-800 rounded-lg">
            <h1 className="text-2xl font-bold text-red-500 mb-4">⚠️ Something Went Wrong</h1>
            <p className="text-gray-300 mb-4">
              The application encountered an error. Please check the console for details.
            </p>
            {this.state.error && (
              <div className="bg-gray-900 p-4 rounded mb-4 overflow-auto">
                <pre className="text-sm text-red-400">{this.state.error.toString()}</pre>
              </div>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

