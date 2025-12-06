"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type NavbarPosition = "sticky" | "fixed";
type NavbarContainerSize = "default" | "wide" | "full";

interface UINavbarProps {
  children: React.ReactNode;
  className?: string;
  position?: NavbarPosition;
  scrollThreshold?: number;
  ariaLabel?: string;
}

export function UINavbar({
  children,
  className = "",
  position = "sticky",
  scrollThreshold = 12,
  ariaLabel = "Navigasi utama",
}: UINavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > scrollThreshold);
  }, [scrollThreshold]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    requestAnimationFrame(() => {
      handleScroll();
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const positionClass = useMemo(() => {
    if (position === "fixed") return "fixed top-0 left-0";
    return "sticky top-0";
  }, [position]);

  const baseClass =
    "z-50 w-full border-none transition-[background-color,box-shadow] duration-200";

  const topClass = "bg-transparent shadow-none";

  const scrolledClass =
    "bg-card shadow-[0_10px_30px_-20px_rgba(15,23,42,0.25)]";

  return (
    <nav
      aria-label={ariaLabel}
      className={joinClasses(
        baseClass,
        positionClass,
        isScrolled ? scrolledClass : topClass,
        className
      )}
    >
      {children}
    </nav>
  );
}

interface UINavbarSpacerProps {
  className?: string;
}

export function UINavbarSpacer({ className = "" }: UINavbarSpacerProps) {
  return <div aria-hidden="true" className={joinClasses("h-16", className)} />;
}

interface UINavbarContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: NavbarContainerSize;
}

export function UINavbarContainer({
  children,
  className = "",
  size = "wide",
}: UINavbarContainerProps) {
  const maxWidthClass = useMemo(() => {
    if (size === "full") return "max-w-none";
    if (size === "default") return "max-w-7xl";
    return "max-w-screen-2xl";
  }, [size]);

  return (
    <div
      className={joinClasses(
        "w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10",
        maxWidthClass,
        className
      )}
    >
      {children}
    </div>
  );
}

interface UINavbarItemProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  ariaLabel?: string;
}

export function UINavbarItem({
  children,
  href,
  onClick,
  className = "",
  ariaLabel,
}: UINavbarItemProps) {
  const baseStyles =
    "inline-flex items-center justify-center text-muted-foreground hover:text-primary " +
    "px-3 py-2 rounded-md text-sm font-medium transition-colors " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const computedAriaLabel =
    ariaLabel ?? (typeof children === "string" ? children : "Item navigasi");

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    const isEnter = event.key === "Enter";
    const isSpace = event.key === " ";
    if (!isEnter && !isSpace) return;

    event.preventDefault();
    (event.currentTarget as HTMLElement).click();
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!onClick) return;
      onClick(event);
    },
    [onClick]
  );

  if (href) {
    return (
      <a
        href={href}
        tabIndex={0}
        aria-label={computedAriaLabel}
        onClick={
          handleClick as unknown as React.MouseEventHandler<HTMLAnchorElement>
        }
        onKeyDown={
          handleKeyDown as unknown as React.KeyboardEventHandler<HTMLAnchorElement>
        }
        className={joinClasses(baseStyles, className)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      tabIndex={0}
      aria-label={computedAriaLabel}
      onClick={
        handleClick as unknown as React.MouseEventHandler<HTMLButtonElement>
      }
      onKeyDown={
        handleKeyDown as unknown as React.KeyboardEventHandler<HTMLButtonElement>
      }
      className={joinClasses(baseStyles, className)}
    >
      {children}
    </button>
  );
}
