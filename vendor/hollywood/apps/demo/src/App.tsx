import { useState } from 'react';
import { formatDate } from '@legacyguard/logic';

function App() {
  const [progress, setProgress] = useState(60);
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);

  // Simple email validation function since it's not exported from logic package
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailValidation = () => {
    const isValid = validateEmail(email);
    setEmailValid(isValid);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-12 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Hollywood Demo App
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Demonstrating monorepo package integration
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Today's Date: {formattedDate}</p>
          </div>

          {/* UI Components Showcase */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">UI Components Demo</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Simple demonstration of monorepo packages
            </p>
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Progress Bar</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setProgress(Math.max(0, progress - 10))}
                  >
                    Decrease
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setProgress(Math.min(100, progress + 10))}
                  >
                    Increase
                  </button>
                  <span className="px-4 py-2">{progress}%</span>
                </div>
              </div>

              {/* Email Validation */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Email Validation</h3>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleEmailValidation}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Validate Email
                  </button>
                  {emailValid !== null && (
                    <div className={`p-4 rounded-lg ${
                      emailValid
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {emailValid
                        ? '✓ Valid email address'
                        : '✗ Invalid email address'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Logic Package Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Logic Package Features</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Utilities from @legacyguard/logic
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">✓</span>
                <span>Date Formatting: {formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">✓</span>
                <span>API Error Handling</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">✓</span>
                <span>Type Definitions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">✓</span>
                <span>Service Integration</span>
              </div>
            </div>
          </div>

          {/* Monorepo Structure */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Monorepo Structure</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This demo app showcases the monorepo integration
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">@legacyguard/ui</h3>
                <p className="text-sm text-gray-600">UI components library with Tamagui</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">@legacyguard/logic</h3>
                <p className="text-sm text-gray-600">Business logic and utilities</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">@hollywood/shared</h3>
                <p className="text-sm text-gray-600">Shared services and types</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Built with Vite + React + TypeScript + Tailwind CSS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
