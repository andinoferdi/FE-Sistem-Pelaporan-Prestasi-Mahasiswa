"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isDisabled: boolean;
}

export interface CalendarMonth {
  month: number;
  year: number;
  days: CalendarDay[];
}

// ============================================
// Utility Functions
// ============================================

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isDateInRange(
  date: Date,
  start: Date | null,
  end: Date | null
): boolean {
  if (!start || !end) return false;
  return date > start && date < end;
}

function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[]
): boolean {
  if (minDate && date < minDate) return true;
  if (maxDate && date > maxDate) return true;
  if (disabledDates?.some((d) => isSameDay(d, date))) return true;
  return false;
}

// ============================================
// Calendar Root
// ============================================

interface CalendarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CalendarRoot = React.forwardRef<HTMLDivElement, CalendarRootProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-[320px] rounded-xl border border-border bg-card p-4 shadow-lg",
          "backdrop-blur-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CalendarRoot.displayName = "CalendarRoot";

// ============================================
// Calendar Header
// ============================================

interface CalendarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthClick?: () => void;
  onYearClick?: () => void;
  showMonthYearPicker?: boolean;
}

const CalendarHeader = React.forwardRef<HTMLDivElement, CalendarHeaderProps>(
  (
    {
      className,
      month,
      year,
      onPrevMonth,
      onNextMonth,
      onMonthClick,
      onYearClick,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between mb-4", className)}
        {...props}
      >
        <button
          type="button"
          onClick={onPrevMonth}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-accent transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMonthClick}
            className={cn(
              "px-2 py-1 rounded-md font-medium text-sm",
              "hover:bg-accent transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {MONTHS[month]}
          </button>
          <button
            type="button"
            onClick={onYearClick}
            className={cn(
              "px-2 py-1 rounded-md font-medium text-sm",
              "hover:bg-accent transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {year}
          </button>
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-accent transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }
);
CalendarHeader.displayName = "CalendarHeader";

// ============================================
// Calendar Weekdays
// ============================================

type CalendarWeekdaysProps = React.HTMLAttributes<HTMLDivElement>;

const CalendarWeekdays = React.forwardRef<
  HTMLDivElement,
  CalendarWeekdaysProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid grid-cols-7 mb-2", className)}
      {...props}
    >
      {DAYS.map((day) => (
        <div
          key={day}
          className="flex h-9 items-center justify-center text-xs font-medium text-muted-foreground"
        >
          {day}
        </div>
      ))}
    </div>
  );
});
CalendarWeekdays.displayName = "CalendarWeekdays";

// ============================================
// Calendar Grid
// ============================================

interface CalendarGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CalendarGrid = React.forwardRef<HTMLDivElement, CalendarGridProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-7 gap-0.5", className)}
        role="grid"
        {...props}
      >
        {children}
      </div>
    );
  }
);
CalendarGrid.displayName = "CalendarGrid";

// ============================================
// Calendar Day
// ============================================

interface CalendarDayButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  day: CalendarDay;
  onSelectDate: (date: Date) => void;
}

const CalendarDayButton = React.forwardRef<
  HTMLButtonElement,
  CalendarDayButtonProps
>(({ className, day, onSelectDate, ...props }, ref) => {
  const handleClick = () => {
    if (!day.isDisabled) {
      onSelectDate(day.date);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      disabled={day.isDisabled}
      onClick={handleClick}
      className={cn(
        "relative flex h-9 w-full items-center justify-center",
        "text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "rounded-lg",
        // Base states
        !day.isCurrentMonth && "text-muted-foreground/40",
        day.isCurrentMonth && "text-foreground",
        day.isDisabled && "text-muted-foreground/30 cursor-not-allowed",
        // Hover state
        !day.isDisabled &&
          !day.isSelected &&
          "hover:bg-accent hover:text-accent-foreground",
        // Today indicator
        day.isToday &&
          !day.isSelected &&
          "bg-accent text-accent-foreground font-semibold",
        // Selected state
        day.isSelected &&
          "bg-primary text-primary-foreground font-semibold shadow-sm",
        // Range states
        day.isInRange && "bg-primary/10 rounded-none",
        day.isRangeStart &&
          "rounded-l-lg rounded-r-none bg-primary text-primary-foreground",
        day.isRangeEnd &&
          "rounded-r-lg rounded-l-none bg-primary text-primary-foreground",
        className
      )}
      role="gridcell"
      aria-selected={day.isSelected}
      aria-disabled={day.isDisabled}
      tabIndex={day.isDisabled ? -1 : 0}
      {...props}
    >
      {day.date.getDate()}
      {day.isToday && !day.isSelected && (
        <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
      )}
    </button>
  );
});
CalendarDayButton.displayName = "CalendarDayButton";

// ============================================
// Month Picker
// ============================================

interface MonthPickerProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
}

const MonthPicker = React.forwardRef<HTMLDivElement, MonthPickerProps>(
  ({ className, selectedMonth, onSelectMonth, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-3 gap-2 p-2", className)}
        {...props}
      >
        {MONTHS.map((month, index) => (
          <button
            key={month}
            type="button"
            onClick={() => onSelectMonth(index)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedMonth === index &&
                "bg-primary text-primary-foreground shadow-sm"
            )}
          >
            {month.slice(0, 3)}
          </button>
        ))}
      </div>
    );
  }
);
MonthPicker.displayName = "MonthPicker";

// ============================================
// Year Picker
// ============================================

interface YearPickerProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedYear: number;
  onSelectYear: (year: number) => void;
  startYear?: number;
  endYear?: number;
}

const YearPicker = React.forwardRef<HTMLDivElement, YearPickerProps>(
  (
    {
      className,
      selectedYear,
      onSelectYear,
      startYear = 1900,
      endYear = 2100,
      ...props
    },
    ref
  ) => {
    const years = React.useMemo(() => {
      const yearsArray: number[] = [];
      const startDecade = Math.floor(selectedYear / 10) * 10 - 4;
      for (let i = 0; i < 12; i++) {
        const year = startDecade + i;
        if (year >= startYear && year <= endYear) {
          yearsArray.push(year);
        }
      }
      return yearsArray;
    }, [selectedYear, startYear, endYear]);

    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-3 gap-2 p-2", className)}
        {...props}
      >
        {years.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => onSelectYear(year)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedYear === year &&
                "bg-primary text-primary-foreground shadow-sm"
            )}
          >
            {year}
          </button>
        ))}
      </div>
    );
  }
);
YearPicker.displayName = "YearPicker";

// ============================================
// Quick Actions
// ============================================

interface QuickActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelectToday: () => void;
  onClear: () => void;
}

const QuickActions = React.forwardRef<HTMLDivElement, QuickActionsProps>(
  ({ className, onSelectToday, onClear, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between border-t border-border pt-3 mt-3",
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "text-xs font-medium text-muted-foreground",
            "hover:text-foreground transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          )}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onSelectToday}
          className={cn(
            "text-xs font-medium text-primary",
            "hover:text-primary/80 transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          )}
        >
          Today
        </button>
      </div>
    );
  }
);
QuickActions.displayName = "QuickActions";

// ============================================
// Exports
// ============================================

export {
  CalendarRoot,
  CalendarHeader,
  CalendarWeekdays,
  CalendarGrid,
  CalendarDayButton,
  MonthPicker,
  YearPicker,
  QuickActions,
  DAYS,
  MONTHS,
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
  isDateInRange,
  isDateDisabled,
};
