import React from 'react';

export default function ConfirmDialog({ open, title='Confirmar', message, onCancel, onConfirm, isDark }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className={`relative w-full max-w-md rounded-xl p-5 shadow-xl ${isDark?'bg-gray-800 text-white':'bg-white text-gray-900'}`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onCancel} className={`${isDark?'text-gray-300':'text-gray-500'}`}>✕</button>
        </div>
        <div className={`${isDark?'text-gray-300':'text-gray-600'}`}>{message}</div>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button onClick={onCancel} className="px-3 py-2 rounded-md text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-700">No</button>
          <button onClick={onConfirm} className="px-3 py-2 rounded-md text-white bg-pink-600 hover:bg-pink-700">Sí</button>
        </div>
      </div>
    </div>
  );
}