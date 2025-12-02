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
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
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
