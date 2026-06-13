'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
                        An unexpected error occurred. This might be a temporary issue — try refreshing the page.
                    </p>
                    {this.state.error && (
                        <p className="text-xs text-red-500 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-lg mb-6 max-w-lg break-all">
                            {this.state.error.message}
                        </p>
                    )}
                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
