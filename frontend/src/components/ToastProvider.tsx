import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Toast = { id: number; message: string; type?: 'info' | 'success' | 'error' };

const ToastContext = createContext<{ show: (message: string, type?: Toast['type']) => void } | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const t: Toast = { id, message, type };
    setToasts(s => [...s, t]);
    // auto-dismiss
    setTimeout(() => setToasts(s => s.filter(x => x.id !== id)), 4000);
  }, []);

  // expose a simple global fallback so parts of app that can't use the hook can still show toasts
  useEffect(() => {
    (window as any).__APP_TOAST__ = (msg: string, type: Toast['type'] = 'info') => show(msg, type);
    return () => { try { delete (window as any).__APP_TOAST__; } catch {} };
  }, [show]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-xs px-3 py-2 rounded shadow-md text-white flex items-start gap-3 justify-between transform transition-all duration-200 ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="flex-1 text-sm">{t.message}</div>
            <button onClick={() => setToasts(s => s.filter(x => x.id !== t.id))} className="text-white opacity-80 hover:opacity-100 ml-2 text-xs">Fechar</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
