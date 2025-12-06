import React, { useCallback, useMemo } from "react";
import Link from "next/link";

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type FooterContainerSize = "default" | "wide" | "full";

interface UIFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function UIFooter({ children, className = "" }: UIFooterProps) {
  return (
    <footer className={joinClasses("bg-background text-muted-foreground", className)}>
      {children}
    </footer>
  );
}

interface UIFooterContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: FooterContainerSize;
}

export function UIFooterContainer({
  children,
  className = "",
  size = "wide",
}: UIFooterContainerProps) {
  const maxWidthClass = useMemo(() => {
    if (size === "full") return "max-w-none";
    if (size === "default") return "max-w-7xl";
    return "max-w-screen-2xl";
  }, [size]);

  return (
    <div
      className={joinClasses(
        "w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 py-12",
        maxWidthClass,
        className
      )}
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
      <h4 className="text-foreground font-semibold mb-4 text-sm">{title}</h4>
      {children}
    </div>
  );
}

interface UIFooterLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
}

export function UIFooterLink({
  href,
  children,
  className = "",
  external = false,
  ariaLabel,
}: UIFooterLinkProps) {
  const computedAriaLabel =
    ariaLabel ?? (typeof children === "string" ? children : "Tautan footer");

  const baseClass = joinClasses(
    "text-sm text-muted-foreground hover:text-foreground transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const isEnter = event.key === "Enter";
      const isSpace = event.key === " ";

      if (!isEnter && !isSpace) return;

      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    },
    []
  );

  if (external) {
    return (
      <a
        href={href}
        tabIndex={0}
        aria-label={computedAriaLabel}
        onKeyDown={handleKeyDown}
        target="_blank"
        rel="noreferrer"
        className={baseClass}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      tabIndex={0}
      aria-label={computedAriaLabel}
      onKeyDown={handleKeyDown}
      className={baseClass}
    >
      {children}
    </Link>
  );
}
