"use client";

import React from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-md mx-4">
        <div className="bg-card border border-border rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
          )}
          <div className="flex gap-3 justify-end">{children}</div>
        </div>
      </div>
    </div>
  );
}

