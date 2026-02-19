"use client";

import { Suspense } from 'react';
import Login from './login';

export default function LoginWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full">
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <Login />
    </Suspense>
  );
}
