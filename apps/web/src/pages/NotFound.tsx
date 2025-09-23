import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-8xl font-bold text-slate-800 select-none">
            404
          </div>
          <div className="absolute inset-0 text-8xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text animate-pulse">
            404
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            asChild
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
          >
            <Link to="/dashboard">
              <Home className="mr-2" size={20} />
              Go to Dashboard
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2" size={20} />
            Go Back
          </Button>
        </div>

        {/* Help */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-400">
            Need help? {' '}
            <Link
              to="/contact"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}