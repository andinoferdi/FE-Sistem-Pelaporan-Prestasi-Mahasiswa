import React from "react";

interface UINavbarProps {
  children: React.ReactNode;
  className?: string;
}

export function UINavbar({ children, className = "" }: UINavbarProps) {
  return (
    <nav className={`bg-white shadow-md border-b border-gray-200 ${className}`}>
      {children}
    </nav>
  );
}

interface UINavbarContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function UINavbarContainer({
  children,
  className = "",
}: UINavbarContainerProps) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

interface UINavbarItemProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function UINavbarItem({
  children,
  href,
  onClick,
  className = "",
}: UINavbarItemProps) {
  const baseStyles =
    "text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors";

  if (href) {
    return (
      <a href={href} className={`${baseStyles} ${className}`}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${baseStyles} ${className}`}>
      {children}
    </button>
  );
}
