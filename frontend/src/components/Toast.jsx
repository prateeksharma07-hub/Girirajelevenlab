import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div 
            key={toast.id} 
            className={`toast-item ${isError ? 'error' : isSuccess ? 'success' : ''}`}
          >
            {isSuccess && <CheckCircle2 size={16} className="text-emerald-400" />}
            {isError && <AlertCircle size={16} className="text-rose-400" />}
            {!isSuccess && !isError && <Info size={16} className="text-indigo-400" />}

            <span style={{ flex: 1 }}>{toast.message}</span>

            <button
              onClick={() => onDismiss(toast.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
