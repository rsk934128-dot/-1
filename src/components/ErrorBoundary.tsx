import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('ErrorBoundary captured runtime error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-800 border border-stone-700 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">
              হোটেল আল শেখ ফরিদ
            </h2>
            <p className="text-sm text-stone-300 mb-6 leading-relaxed">
              সাময়িক যান্ত্রিক ত্রুটি দেখা দিয়েছে। পৃষ্ঠাটি পুনরায় লোড করে খাবার অর্ডার চালিয়ে যান।
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 active:scale-98 transition text-stone-950 font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>রিলোড করুন (Reload)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
