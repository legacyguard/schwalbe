import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
}

export default function ErrorPage({
  error,
  resetError,
  title = "Something went wrong",
  message = "We're sorry, but something unexpected happened. Please try again."
}: ErrorPageProps) {
  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg text-center space-y-8">
        {/* Error Icon */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
            <AlertTriangle size={40} className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">
            {title}
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left bg-slate-900 rounded-lg p-4 border border-slate-700">
            <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs text-red-400 overflow-auto max-h-40 whitespace-pre-wrap">
              {error.message}
              {error.stack && '\n\nStack trace:\n' + error.stack}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
          >
            <RefreshCw className="mr-2" size={20} />
            Try Again
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <Link to="/dashboard">
              <Home className="mr-2" size={20} />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Help */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-400">
            If this problem persists, please {' '}
            <Link
              to="/contact"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}