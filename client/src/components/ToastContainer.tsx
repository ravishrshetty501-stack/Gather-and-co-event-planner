import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Toast as ToastType } from '../types';

interface Props {
  toasts: ToastType[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: Props) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  if (!visible) return null;

  return (
    <div className={`toast ${toast.type}`}>
      <span>{toast.message}</span>
      <button className="toast-close" onClick={() => onRemove(toast.id)} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
}
