import { Component } from 'react';
import { Shield } from 'lucide-react';

/**
 * ErrorBoundary – Catches errors in 3D scene and renders a fallback UI.
 * Prevents the entire auth page from crashing if Three.js fails to load.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('[3D Scene] Failed to load:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 -z-10 bg-background">
          {/* Subtle gradient background as fallback */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px]" />
          </div>
          {/* Minimal status indicator */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-muted-foreground/50">
            <Shield size={10} />
            3D unavailable
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
