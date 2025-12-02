"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-2xl border text-card-foreground", {
  variants: {
    variant: {
      default: "bg-card border-border shadow-sm",
      elevated:
        "bg-card border-border shadow-md hover:shadow-lg transition-shadow",
      outlined: "bg-transparent border-2 border-border",
      filled: "bg-muted border-transparent",
      glass: "bg-card/80 backdrop-blur-sm border-border/50",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      default: "p-0",
      lg: "p-8",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-lg",
      default: "rounded-2xl",
      lg: "rounded-3xl",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "default",
    radius: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, radius, hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding, radius }),
        hover &&
          "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const cardHeaderVariants = cva("flex flex-col space-y-1.5", {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-4 pb-0",
      default: "px-6 py-5 border-b border-border/50",
      lg: "p-8 pb-0",
    },
  },
  defaultVariants: {
    padding: "default",
  },
});

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ padding, className }))}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const cardContentVariants = cva("", {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-4",
      default: "px-6 py-5",
      lg: "p-8",
    },
  },
  defaultVariants: {
    padding: "default",
  },
});

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ padding, className }))}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

const cardFooterVariants = cva("flex items-center", {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-4 pt-0",
      default: "px-6 py-4 border-t border-border/50 bg-muted/30 rounded-b-2xl",
      lg: "p-8 pt-0",
    },
    direction: {
      row: "flex-row",
      column: "flex-col",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
  },
  defaultVariants: {
    padding: "default",
    direction: "row",
    justify: "start",
  },
});

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding, direction, justify, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardFooterVariants({ padding, direction, justify, className })
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
