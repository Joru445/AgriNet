import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-[#F5FBF7] px-4 py-8">
          <div className="w-full max-w-md text-center rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-gray-100">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <i className="ri-error-warning-line text-3xl" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              An unexpected error occurred. You can reload the application or return to the main page.
            </p>

            {this.state.error?.message && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left text-xs font-mono text-gray-700 overflow-x-auto max-h-32 border border-gray-200">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1B4332] transition-colors cursor-pointer"
              >
                <i className="ri-refresh-line" />
                Reload App
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <i className="ri-home-4-line" />
                Go to Home
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

