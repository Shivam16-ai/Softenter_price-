import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 p-4">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          <div className="ml-auto h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
};
