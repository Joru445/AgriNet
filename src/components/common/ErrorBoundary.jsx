import React from "react";

import { t } from "../../i18n";

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
        <main className="min-h-screen flex items-center justify-center bg-[var(--agri-page)] px-4 py-8">
          <div className="w-full max-w-md text-center rounded-2xl bg-[var(--agri-card)] p-6 sm:p-8 shadow-xl border border-[var(--agri-border-subtle)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-600">
              <i className="ri-error-warning-line text-3xl" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[var(--agri-text)]">
              {t("errorBoundary.title")}
            </h1>

            <p className="mt-2 text-sm text-[var(--agri-text-secondary)]">
              {t("errorBoundary.description")}
            </p>

            {this.state.error?.message && (
              <div className="mt-4 p-3 bg-[var(--agri-hover)] rounded-lg text-left text-xs font-mono text-[var(--agri-text-secondary)] overflow-x-auto max-h-32 border border-[var(--agri-border)]">
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
                {t("errorBoundary.reloadApp")}
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-5 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition-colors cursor-pointer"
              >
                <i className="ri-home-4-line" />
                {t("errorBoundary.goToHome")}
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

