// src/components/ui/Modal.tsx
'use client';
import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>
        {title && <div className="text-lg font-semibold mb-4 pt-2 px-4">{title}</div>}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
