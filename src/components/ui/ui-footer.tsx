import React from "react";

interface UIFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function UIFooter({ children, className = "" }: UIFooterProps) {
  return (
    <footer className={`bg-gray-800 text-gray-300 ${className}`}>
      {children}
    </footer>
  );
}

interface UIFooterContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function UIFooterContainer({
  children,
  className = "",
}: UIFooterContainerProps) {
  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${className}`}
    >
      {children}
    </div>
  );
}

interface UIFooterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function UIFooterSection({
  title,
  children,
  className = "",
}: UIFooterSectionProps) {
  return (
    <div className={className}>
      <h4 className="text-white font-semibold mb-4">{title}</h4>
      {children}
    </div>
  );
}

interface UIFooterLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function UIFooterLink({
  href,
  children,
  className = "",
}: UIFooterLinkProps) {
  return (
    <a
      href={href}
      className={`text-sm hover:text-white transition-colors ${className}`}
    >
      {children}
    </a>
  );
}
