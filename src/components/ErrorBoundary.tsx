import React from "react";

class ErrorBoundary extends React.Component<{ fallback?: React.ReactNode, children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { fallback?: React.ReactNode, children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }
      return (
        <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-lg w-full">
          <h2 className="font-bold mb-2">Component Error</h2>
          <pre className="text-xs overflow-auto whitespace-pre-wrap">{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
