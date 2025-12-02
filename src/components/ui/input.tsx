import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-3",
          "bg-card text-foreground",
          "border-2 rounded-xl",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-60",
          "transition-all duration-200",
          error
            ? "border-destructive focus:ring-destructive/20"
            : "border-border",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-destructive flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
