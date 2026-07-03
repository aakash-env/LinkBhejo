"use client";

import React, { Component, ErrorInfo } from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ padding: "2rem", color: "#e8f0ee", background: "#080c0c", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
          <h2 style={{ color: "#00e599", marginBottom: "1rem" }}>Something went wrong</h2>
          <p style={{ color: "#7a9490", marginBottom: "1.5rem", maxWidth: "400px", textAlign: "center" }}>
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{ padding: "0.5rem 1.5rem", background: "#00e599", color: "#001a10", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
