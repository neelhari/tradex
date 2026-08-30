import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors so a single bad screen shows a readable message
 * instead of a blank white page. Without this, any thrown TypeError unmounts
 * the whole React tree and leaves no clue as to what failed.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Trade Nexus] Screen crashed:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-rose-200 rounded-3xl shadow-xl max-w-lg w-full p-6 space-y-4">
          <div>
            <h1 className="font-display font-black text-lg text-[#0A2540]">This screen hit an error</h1>
            <p className="text-xs text-slate-500 mt-1">
              The rest of the app is still running — go back, or reload to start fresh.
            </p>
          </div>

          <pre className="text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-rose-700 overflow-x-auto whitespace-pre-wrap">
            {error.message}
          </pre>

          <div className="flex gap-2">
            <button
              onClick={this.handleReset}
              className="flex-1 py-2.5 rounded-xl bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-black text-xs transition-all"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all"
            >
              Reload app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
