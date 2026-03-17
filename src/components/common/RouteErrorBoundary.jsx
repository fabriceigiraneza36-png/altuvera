// components/common/RouteErrorBoundary.jsx
import React from "react";

class RouteErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[RouteError]", error, info);
    // Send to your error tracking service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          padding: 40,
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: 28, marginBottom: 12, color: "#1a1a1a" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#6B7280", marginBottom: 24, maxWidth: 480 }}>
            We encountered an unexpected error loading this page.
            Please try refreshing or navigate back.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              padding: "12px 32px",
              backgroundColor: "#059669",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default RouteErrorBoundary;