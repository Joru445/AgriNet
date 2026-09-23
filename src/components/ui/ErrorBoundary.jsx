import React from "react";

import Button from "./Button";
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
        <main className="min-h-screen flex items-center justify-center bg-(--agri-page) px-4 py-8">
          <div className="w-full max-w-md text-center rounded-2xl bg-(--agri-card) p-6 sm:p-8 shadow-xl border border-(--agri-border-subtle)">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-600">
              <i className="ri-error-warning-line text-3xl" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-(--agri-text)">
              {t("errorBoundary.title")}
            </h1>

            <p className="mt-2 text-sm text-(--agri-text-secondary)">
              {t("errorBoundary.description")}
            </p>

            {this.state.error?.message && (
              <div className="mt-4 p-3 bg-(--agri-hover) rounded-lg text-left text-xs font-mono text-(--agri-text-secondary) overflow-x-auto max-h-32 border border-(--agri-border)">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" size="md" onClick={this.handleReload} icon="ri-refresh-line" className="w-full sm:w-auto">
                {t("errorBoundary.reloadApp")}
              </Button>

              <Button variant="cancel" size="md" onClick={this.handleGoHome} icon="ri-home-4-line" className="w-full sm:w-auto">
                {t("errorBoundary.goToHome")}
              </Button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

