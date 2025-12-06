"use client";

import * as React from "react";
import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CalendarRoot,
  CalendarHeader,
  CalendarWeekdays,
  CalendarGrid,
  CalendarDayButton,
  MonthPicker,
  YearPicker,
  QuickActions,
  type CalendarDay,
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
  isDateInRange,
  isDateDisabled,
} from "@/components/dashboard/ui/ui-date-picker";



type PickerMode = "days" | "months" | "years";
type SelectionMode = "single" | "range";

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  onRangeChange?: (start: Date | null, end: Date | null) => void;
  selectionMode?: SelectionMode;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  placeholder?: string;
  format?: (date: Date) => string;
  className?: string;
  triggerClassName?: string;
  calendarClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  showQuickActions?: boolean;
  showOutsideDays?: boolean;
  closeOnSelect?: boolean;
}


const defaultFormat = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


export function DatePicker({
  value,
  onChange,
  startDate,
  endDate,
  onRangeChange,
  selectionMode = "single",
  minDate,
  maxDate,
  disabledDates,
  placeholder = "Select date",
  format = defaultFormat,
  className,
  triggerClassName,
  calendarClassName,
  disabled = false,
  readOnly = false,
  showQuickActions = true,
  showOutsideDays = true,
  closeOnSelect = true,
}: DatePickerProps) {


  const [isOpen, setIsOpen] = React.useState(false);
  const [pickerMode, setPickerMode] = React.useState<PickerMode>("days");
  const [viewDate, setViewDate] = React.useState(() => {
    if (value) return new Date(value);
    if (startDate) return new Date(startDate);
    return new Date();
  });

  const [rangeStart, setRangeStart] = React.useState<Date | null>(
    startDate || null
  );
  const [rangeEnd, setRangeEnd] = React.useState<Date | null>(endDate || null);
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (value) setViewDate(new Date(value));
  }, [value]);

  React.useEffect(() => {
    if (startDate) setRangeStart(startDate);
    if (endDate) setRangeEnd(endDate);
  }, [startDate, endDate]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setPickerMode("days");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);


  const handlePrevMonth = () => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleSelectMonth = (month: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(month);
      return newDate;
    });
    setPickerMode("days");
  };

  const handleSelectYear = (year: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setPickerMode("months");
  };

  const handleSelectDate = (date: Date) => {
    if (selectionMode === "single") {
      onChange?.(date);
      if (closeOnSelect) {
        setIsOpen(false);
        setPickerMode("days");
      }
    } else {
      // Range selection logic
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range
        setRangeStart(date);
        setRangeEnd(null);
        onRangeChange?.(date, null);
      } else {
        // Complete range
        if (date < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(date);
          onRangeChange?.(date, rangeStart);
        } else {
          setRangeEnd(date);
          onRangeChange?.(rangeStart, date);
        }
        if (closeOnSelect) {
          setIsOpen(false);
          setPickerMode("days");
        }
      }
    }
  };

  const handleSelectToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectionMode === "single") {
      onChange?.(today);
    } else {
      setRangeStart(today);
      setRangeEnd(null);
      onRangeChange?.(today, null);
    }
    setViewDate(today);
  };

  const handleClear = () => {
    if (selectionMode === "single") {
      onChange?.(null);
    } else {
      setRangeStart(null);
      setRangeEnd(null);
      onRangeChange?.(null, null);
    }
  };

  const toggleOpen = () => {
    if (!disabled && !readOnly) {
      setIsOpen((prev) => !prev);
      if (!isOpen) {
        setPickerMode("days");
      }
    }
  };

  // ========================================
  // Generate Calendar Days
  // ========================================

  const calendarDays = React.useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    // Previous month days
    if (showOutsideDays) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

      for (let i = firstDay - 1; i >= 0; i--) {
        const date = new Date(prevYear, prevMonth, daysInPrevMonth - i);
        date.setHours(0, 0, 0, 0);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
          isSelected:
            selectionMode === "single"
              ? value
                ? isSameDay(date, value)
                : false
              : false,
          isInRange:
            selectionMode === "range"
              ? isDateInRange(
                  date,
                  rangeStart,
                  hoverDate && !rangeEnd ? hoverDate : rangeEnd
                )
              : false,
          isRangeStart: rangeStart ? isSameDay(date, rangeStart) : false,
          isRangeEnd:
            (rangeEnd ? isSameDay(date, rangeEnd) : false) ||
            (hoverDate && !rangeEnd && rangeStart
              ? isSameDay(date, hoverDate)
              : false),
          isDisabled: isDateDisabled(date, minDate, maxDate, disabledDates),
        });
      }
    } else {
      for (let i = 0; i < firstDay; i++) {
        const date = new Date(year, month, -firstDay + i + 1);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          isInRange: false,
          isRangeStart: false,
          isRangeEnd: false,
          isDisabled: true,
        });
      }
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected:
          selectionMode === "single"
            ? value
              ? isSameDay(date, value)
              : false
            : rangeStart
            ? isSameDay(date, rangeStart)
            : false || (rangeEnd ? isSameDay(date, rangeEnd) : false),
        isInRange:
          selectionMode === "range"
            ? isDateInRange(
                date,
                rangeStart,
                hoverDate && !rangeEnd ? hoverDate : rangeEnd
              )
            : false,
        isRangeStart: rangeStart ? isSameDay(date, rangeStart) : false,
        isRangeEnd:
          (rangeEnd ? isSameDay(date, rangeEnd) : false) ||
          (hoverDate && !rangeEnd && rangeStart
            ? isSameDay(date, hoverDate)
            : false),
        isDisabled: isDateDisabled(date, minDate, maxDate, disabledDates),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    if (showOutsideDays) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;

      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(nextYear, nextMonth, i);
        date.setHours(0, 0, 0, 0);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
          isSelected:
            selectionMode === "single"
              ? value
                ? isSameDay(date, value)
                : false
              : false,
          isInRange:
            selectionMode === "range"
              ? isDateInRange(
                  date,
                  rangeStart,
                  hoverDate && !rangeEnd ? hoverDate : rangeEnd
                )
              : false,
          isRangeStart: rangeStart ? isSameDay(date, rangeStart) : false,
          isRangeEnd:
            (rangeEnd ? isSameDay(date, rangeEnd) : false) ||
            (hoverDate && !rangeEnd && rangeStart
              ? isSameDay(date, hoverDate)
              : false),
          isDisabled: isDateDisabled(date, minDate, maxDate, disabledDates),
        });
      }
    }

    return days;
  }, [
    viewDate,
    value,
    rangeStart,
    rangeEnd,
    hoverDate,
    selectionMode,
    minDate,
    maxDate,
    disabledDates,
    showOutsideDays,
  ]);

  // ========================================
  // Display Value
  // ========================================

  const displayValue = React.useMemo(() => {
    if (selectionMode === "single") {
      return value ? format(value) : "";
    } else {
      if (rangeStart && rangeEnd) {
        return `${format(rangeStart)} - ${format(rangeEnd)}`;
      } else if (rangeStart) {
        return `${format(rangeStart)} - ...`;
      }
      return "";
    }
  }, [value, rangeStart, rangeEnd, selectionMode, format]);

  // ========================================
  // Render
  // ========================================

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Trigger Button */}
      <div className={cn(
        "group relative flex min-w-[280px] items-center gap-3 rounded-xl border border-input bg-background px-4 py-3",
        "hover:border-ring hover:shadow-sm transition-all duration-200",
        isOpen && "border-ring ring-2 ring-ring ring-offset-2",
        triggerClassName
      )}>
        <button
          type="button"
          onClick={toggleOpen}
          disabled={disabled}
          className={cn(
            "flex flex-1 items-center gap-3 text-left transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <Calendar className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span
            className={cn(
              "flex-1 text-sm font-medium",
              !displayValue && "text-muted-foreground"
            )}
          >
            {displayValue || placeholder}
          </span>
        </button>
        {displayValue && !readOnly && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full shrink-0",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "opacity-0 transition-opacity group-hover:opacity-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            )}
            aria-label="Clear date"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
            "duration-200"
          )}
        >
          <CalendarRoot className={calendarClassName}>
            {pickerMode === "days" && (
              <>
                <CalendarHeader
                  month={viewDate.getMonth()}
                  year={viewDate.getFullYear()}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onMonthClick={() => setPickerMode("months")}
                  onYearClick={() => setPickerMode("years")}
                />
                <CalendarWeekdays />
                <CalendarGrid>
                  {calendarDays.map((day, index) => (
                    <CalendarDayButton
                      key={index}
                      day={day}
                      onSelectDate={handleSelectDate}
                      onMouseEnter={() => {
                        if (
                          selectionMode === "range" &&
                          rangeStart &&
                          !rangeEnd
                        ) {
                          setHoverDate(day.date);
                        }
                      }}
                      onMouseLeave={() => setHoverDate(null)}
                    />
                  ))}
                </CalendarGrid>
                {showQuickActions && (
                  <QuickActions
                    onSelectToday={handleSelectToday}
                    onClear={handleClear}
                  />
                )}
              </>
            )}

            {pickerMode === "months" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setPickerMode("days")}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back
                  </button>
                  <span className="text-sm font-semibold">
                    {viewDate.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickerMode("years")}
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Year
                  </button>
                </div>
                <MonthPicker
                  selectedMonth={viewDate.getMonth()}
                  onSelectMonth={handleSelectMonth}
                />
              </>
            )}

            {pickerMode === "years" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setPickerMode("months")}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back
                  </button>
                  <span className="text-sm font-semibold">Select Year</span>
                  <div className="w-10" />
                </div>
                <YearPicker
                  selectedYear={viewDate.getFullYear()}
                  onSelectYear={handleSelectYear}
                />
              </>
            )}
          </CalendarRoot>
        </div>
      )}
    </div>
  );
}

// ============================================
// Inline Calendar (Without Popover)
// ============================================

interface InlineCalendarProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  onRangeChange?: (start: Date | null, end: Date | null) => void;
  selectionMode?: SelectionMode;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showQuickActions?: boolean;
  showOutsideDays?: boolean;
  className?: string;
}

export function InlineCalendar({
  value,
  onChange,
  startDate,
  endDate,
  onRangeChange,
  selectionMode = "single",
  minDate,
  maxDate,
  disabledDates,
  showQuickActions = true,
  showOutsideDays = true,
  className,
}: InlineCalendarProps) {
  const [viewDate, setViewDate] = React.useState(() => {
    if (value) return new Date(value);
    if (startDate) return new Date(startDate);
    return new Date();
  });

  const [rangeStart, setRangeStart] = React.useState<Date | null>(
    startDate || null
  );
  const [rangeEnd, setRangeEnd] = React.useState<Date | null>(endDate || null);
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);
  const [pickerMode, setPickerMode] = React.useState<PickerMode>("days");

  const handlePrevMonth = () => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleSelectMonth = (month: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(month);
      return newDate;
    });
    setPickerMode("days");
  };

  const handleSelectYear = (year: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setPickerMode("months");
  };

  const handleSelectDate = (date: Date) => {
    if (selectionMode === "single") {
      onChange?.(date);
    } else {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(date);
        setRangeEnd(null);
        onRangeChange?.(date, null);
      } else {
        if (date < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(date);
          onRangeChange?.(date, rangeStart);
        } else {
          setRangeEnd(date);
          onRangeChange?.(rangeStart, date);
        }
      }
    }
  };

  const handleSelectToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectionMode === "single") {
      onChange?.(today);
    } else {
      setRangeStart(today);
      setRangeEnd(null);
      onRangeChange?.(today, null);
    }
    setViewDate(today);
  };

  const handleClear = () => {
    if (selectionMode === "single") {
      onChange?.(null);
    } else {
      setRangeStart(null);
      setRangeEnd(null);
      onRangeChange?.(null, null);
    }
  };

  const calendarDays = React.useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    if (showOutsideDays) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

      for (let i = firstDay - 1; i >= 0; i--) {
        const date = new Date(prevYear, prevMonth, daysInPrevMonth - i);
        date.setHours(0, 0, 0, 0);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
          isSelected:
            selectionMode === "single"
              ? value
                ? isSameDay(date, value)
                : false
              : false,
          isInRange:
            selectionMode === "range"
              ? isDateInRange(
                  date,
                  rangeStart,
                  hoverDate && !rangeEnd ? hoverDate : rangeEnd
                )
              : false,
          isRangeStart: rangeStart ? isSameDay(date, rangeStart) : false,
          isRangeEnd:
            (rangeEnd ? isSameDay(date, rangeEnd) : false) ||
            (hoverDate && !rangeEnd && rangeStart
              ? isSameDay(date, hoverDate)
              : false),
          isDisabled: isDateDisabled(date, minDate, maxDate, disabledDates),
        });
      }
    } else {
      for (let i = 0; i < firstDay; i++) {
        const date = new Date(year, month, -firstDay + i + 1);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          isInRange: false,
          isRangeStart: false,
          isRangeEnd: false,
          isDisabled: true,
        });
      }
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected:
          selectionMode === "single"
            ? value
              ? isSameDay(date, value)
              : false
            : rangeStart
            ? isSameDay(date, rangeStart)
            : false || (rangeEnd ? isSameDay(date, rangeEnd) : false),
        isInRange:
          selectionMode === "range"
            ? isDateInRange(
                date,
                rangeStart,
                hoverDate && !rangeEnd ? hoverDate : rangeEnd
              )
            : false,
        isRangeStart: rangeStart ? isSameDay(date, rangeStart) : false,
        isRangeEnd:
          (rangeEnd ? isSameDay(date, rangeEnd) : false) ||
          (hoverDate && !rangeEnd && rangeStart
            ? isSameDay(date, hoverDate)
            : false),
        isDisabled: isDateDisabled(date, minDate, maxDate, disabledDates),
      });
    }

    const remainingDays = 42 - days.length;
    if (showOutsideDays) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;

      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(nextYear, nextMonth, i);
        date.setHours(0, 0, 0, 0);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
          isSelected:
            selectionMode === "single"
              ? value
                ? isSameDay(date, value)
                : false
              : false,
          isInRange:
            selectionMode === "range"
              ? isDateInRange(
                  date,
                  rangeStart,
                  hoverDate && !rangeEnd ? hoverDate : rangeEnd
                )
              : false,
          isRangeStart: rangeStart ? isSameDay(date, rangeStart) : false,
          isRangeEnd:
            (rangeEnd ? isSameDay(date, rangeEnd) : false) ||
            (hoverDate && !rangeEnd && rangeStart
              ? isSameDay(date, hoverDate)
              : false),
          isDisabled: isDateDisabled(date, minDate, maxDate, disabledDates),
        });
      }
    }

    return days;
  }, [
    viewDate,
    value,
    rangeStart,
    rangeEnd,
    hoverDate,
    selectionMode,
    minDate,
    maxDate,
    disabledDates,
    showOutsideDays,
  ]);

  return (
    <CalendarRoot className={className}>
      {pickerMode === "days" && (
        <>
          <CalendarHeader
            month={viewDate.getMonth()}
            year={viewDate.getFullYear()}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onMonthClick={() => setPickerMode("months")}
            onYearClick={() => setPickerMode("years")}
          />
          <CalendarWeekdays />
          <CalendarGrid>
            {calendarDays.map((day, index) => (
              <CalendarDayButton
                key={index}
                day={day}
                onSelectDate={handleSelectDate}
                onMouseEnter={() => {
                  if (selectionMode === "range" && rangeStart && !rangeEnd) {
                    setHoverDate(day.date);
                  }
                }}
                onMouseLeave={() => setHoverDate(null)}
              />
            ))}
          </CalendarGrid>
          {showQuickActions && (
            <QuickActions
              onSelectToday={handleSelectToday}
              onClear={handleClear}
            />
          )}
        </>
      )}

      {pickerMode === "months" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setPickerMode("days")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Back
            </button>
            <span className="text-sm font-semibold">
              {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setPickerMode("years")}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Year
            </button>
          </div>
          <MonthPicker
            selectedMonth={viewDate.getMonth()}
            onSelectMonth={handleSelectMonth}
          />
        </>
      )}

      {pickerMode === "years" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setPickerMode("months")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Back
            </button>
            <span className="text-sm font-semibold">Select Year</span>
            <div className="w-10" />
          </div>
          <YearPicker
            selectedYear={viewDate.getFullYear()}
            onSelectYear={handleSelectYear}
          />
        </>
      )}
    </CalendarRoot>
  );
}
