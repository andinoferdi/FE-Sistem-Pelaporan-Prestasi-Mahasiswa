import React from "react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "success" | "error" | "warning" | "info";
  className?: string;
  onClose?: () => void;
}

export function Alert({
  children,
  variant = "info",
  className = "",
  onClose,
}: AlertProps) {
  const baseStyles = "px-4 py-3 rounded-lg border";

  const variants = {
    success: "bg-success/20 border-success/30 text-success",
    error: "bg-danger/20 border-danger/30 text-danger",
    warning: "bg-warning/20 border-warning/30 text-warning",
    info: "bg-info/20 border-info/30 text-info",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className} relative`}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-current opacity-70 hover:opacity-100"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      {children}
    </div>
  );
}
