import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onHomeClick?: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onHomeClick }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
      <button
        onClick={onHomeClick}
        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">SwiftRoute</span>
      </button>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
          {item.active || !item.onClick ? (
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
              {item.label}
            </span>
          ) : (
            <button
              onClick={item.onClick}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors truncate max-w-xs"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
