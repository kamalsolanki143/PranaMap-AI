import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({ title = 'No Data Available', message = 'There is currently no data to display in this view.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-full min-h-[200px] text-center">
      <div className="w-12 h-12 rounded-full bg-surfaceHover border border-border flex items-center justify-center mb-4 text-text-muted">
        <FileQuestion size={24} />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary max-w-sm">{message}</p>
    </div>
  );
}
