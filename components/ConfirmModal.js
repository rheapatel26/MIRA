'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom confirmation modal for delete actions.
 * Matches the design system — no native confirm() used.
 *
 * Props:
 *   isOpen      — boolean, controls visibility
 *   onConfirm   — called when user clicks "Delete"
 *   onCancel    — called when user clicks "Cancel" or backdrop
 *   patientName — string to show in the confirmation message
 */
export default function ConfirmModal({ isOpen, onConfirm, onCancel, patientName }) {
  const cancelBtnRef = useRef(null);

  // Focus the cancel button when modal opens for accessibility
  useEffect(() => {
    if (isOpen) {
      // Small delay to let the DOM render
      const t = setTimeout(() => cancelBtnRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative bg-white rounded-xl border border-[#C4E2F5] shadow-lg w-full max-w-sm p-6 flex flex-col gap-4">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 id="modal-title" className="text-lg font-semibold text-brand-deep">
            Delete Patient Record
          </h2>
          <p id="modal-desc" className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-800">{patientName}</span>? This action cannot
            be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center pt-1">
          <button
            id="btn-modal-cancel"
            ref={cancelBtnRef}
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[#C4E2F5] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#F0F8FE] focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            id="btn-modal-confirm-delete"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-150"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
