'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-[slideIn_0.3s_ease] bg-white/95"
            style={{
              backdropFilter: 'blur(12px)',
              borderColor: toast.type === 'success' ? '#86efac' : toast.type === 'error' ? '#fca5a5' : '#e2e8f0',
            }}
          >
            {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-700 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle size={18} className="text-rose-700 shrink-0" />}
            {toast.type === 'info' && <CheckCircle size={18} className="text-brand-forest shrink-0" />}
            <span className="text-sm font-medium text-text-primary">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-text-muted hover:text-text-primary shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
