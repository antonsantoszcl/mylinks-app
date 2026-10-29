'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '@/context/LocaleContext';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const { t } = useLocale();
  const resolvedCancelLabel = cancelLabel ?? t('confirmModal.cancel');
  const resolvedConfirmLabel = confirmLabel ?? t('confirmModal.delete');
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-sm"
      >
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {message && <p className="text-xs text-slate-500 mt-1.5 mb-4">{message}</p>}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors min-h-[44px]"
          >
            {resolvedCancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors min-h-[44px]"
          >
            {resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
