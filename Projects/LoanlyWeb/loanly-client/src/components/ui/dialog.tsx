import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ onClose, children, className }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn('liquid-glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl shadow-2xl', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<{
  title: string;
  badge?: React.ReactNode;
  onClose: () => void;
}> = ({ title, badge, onClose }) => (
  <div className="flex items-start justify-between gap-3 border-b border-border p-4">
    <div>
      {badge}
      <h3 className="mt-1 text-base font-semibold text-foreground">{title}</h3>
    </div>
    <button
      onClick={onClose}
      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);
