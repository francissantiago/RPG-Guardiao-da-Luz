import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Toast = { id: number; message: string; type?: 'info' | 'success' | 'error'; visible: boolean };

const ToastContext = createContext<{ show: (message: string, type?: Toast['type']) => void } | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const exitMs = 300; // animation out duration
  const totalMs = 4000; // total time a toast is visible before removal

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const t: Toast = { id, message, type, visible: true };
    setToasts(s => [...s, t]);

    // start exit animation slightly before full timeout
    setTimeout(() => {
      setToasts(s => s.map(x => x.id === id ? { ...x, visible: false } : x));
    }, Math.max(0, totalMs - exitMs));

    // remove after full timeout
    setTimeout(() => {
      setToasts(s => s.filter(x => x.id !== id));
    }, totalMs);
  }, []);

  // expose a simple global fallback so parts of app that can't use the hook can still show toasts
  useEffect(() => {
    (window as any).__APP_TOAST__ = (msg: string, type: Toast['type'] = 'info') => show(msg, type);
    return () => { try { delete (window as any).__APP_TOAST__; } catch {} };
  }, [show]);

  const handleClose = (id: number) => {
    // trigger exit animation then remove
    setToasts(s => s.map(x => x.id === id ? { ...x, visible: false } : x));
    setTimeout(() => setToasts(s => s.filter(x => x.id !== id)), exitMs);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`max-w-xs px-3 py-2 rounded shadow-md text-white flex items-start gap-3 justify-between transform transition-all duration-200 pointer-events-auto ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-800'}`}
            // animation classes controlled by visible flag
            data-visible={t.visible}
            style={{
              animation: t.visible ? 'toast-in 300ms cubic-bezier(.2,.9,.2,1) forwards' : 'toast-out 300ms cubic-bezier(.2,.9,.2,1) forwards'
            }}
          >
            <div className="flex-1 text-sm">{t.message}</div>
            <button onClick={() => handleClose(t.id)} className="text-white opacity-80 hover:opacity-100 ml-2 text-xs">Fechar</button>
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
