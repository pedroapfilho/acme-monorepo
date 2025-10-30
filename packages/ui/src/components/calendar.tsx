"use client";

import { cn } from "../lib/utils";
import { Button, buttonVariants } from "./button";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import * as React from "react";
import { ComponentProps } from "react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: ComponentProps<typeof DayPicker> & {
  buttonVariant?: ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "ui:bg-background ui:group/calendar ui:p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:ui:bg-transparent [[data-slot=popover-content]_&]:ui:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("ui:w-fit", defaultClassNames.root),
        months: cn(
          "ui:relative ui:flex ui:flex-col ui:gap-4 ui:md:flex-row",
          defaultClassNames.months,
        ),
        month: cn("ui:flex ui:w-full ui:flex-col ui:gap-4", defaultClassNames.month),
        nav: cn(
          "ui:absolute ui:inset-x-0 ui:top-0 ui:flex ui:w-full ui:items-center ui:justify-between ui:gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "ui:size-(--cell-size) ui:p-0 ui:select-none ui:aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "ui:size-(--cell-size) ui:p-0 ui:select-none ui:aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "ui:flex ui:h-(--cell-size) ui:w-full ui:items-center ui:justify-center ui:px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "ui:flex ui:h-(--cell-size) ui:w-full ui:items-center ui:justify-center ui:gap-1.5 ui:text-sm ui:font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "ui:has-focus:border-ring ui:border-input ui:has-focus:ring-ring/50 ui:relative ui:rounded-md ui:border ui:shadow-xs ui:has-focus:ring-[3px]",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "ui:bg-popover ui:absolute ui:inset-0 ui:opacity-0",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          "ui:font-medium ui:select-none",
          captionLayout === "label"
            ? "ui:text-sm"
            : "ui:[&>svg]:text-muted-foreground ui:flex ui:h-8 ui:items-center ui:gap-1 ui:rounded-md ui:pr-1 ui:pl-2 ui:text-sm ui:[&>svg]:size-3.5",
          defaultClassNames.caption_label,
        ),
        table: "ui:w-full ui:border-collapse",
        weekdays: cn("ui:flex", defaultClassNames.weekdays),
        weekday: cn(
          "ui:text-muted-foreground ui:flex-1 ui:rounded-md ui:text-[0.8rem] ui:font-normal ui:select-none",
          defaultClassNames.weekday,
        ),
        week: cn("ui:mt-2 ui:flex ui:w-full", defaultClassNames.week),
        week_number_header: cn(
          "ui:w-(--cell-size) ui:select-none",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "ui:text-muted-foreground ui:text-[0.8rem] ui:select-none",
          defaultClassNames.week_number,
        ),
        day: cn(
          "ui:group/day ui:relative ui:aspect-square ui:h-full ui:w-full ui:p-0 ui:text-center ui:select-none ui:[&:first-child[data-selected=true]_button]:rounded-l-md ui:[&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day,
        ),
        range_start: cn(
          "ui:bg-accent ui:rounded-l-md",
          defaultClassNames.range_start,
        ),
        range_middle: cn("ui:rounded-none", defaultClassNames.range_middle),
        range_end: cn("ui:bg-accent ui:rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "ui:bg-accent ui:text-accent-foreground ui:rounded-md ui:data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "ui:text-muted-foreground ui:aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "ui:text-muted-foreground ui:opacity-50",
          defaultClassNames.disabled,
        ),
        hidden: cn("ui:invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("ui:size-4", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("ui:size-4", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("ui:size-4", className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="ui:flex ui:size-(--cell-size) ui:items-center ui:justify-center ui:text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "ui:data-[selected-single=true]:bg-primary ui:data-[selected-single=true]:text-primary-foreground ui:data-[range-middle=true]:bg-accent ui:data-[range-middle=true]:text-accent-foreground ui:data-[range-start=true]:bg-primary ui:data-[range-start=true]:text-primary-foreground ui:data-[range-end=true]:bg-primary ui:data-[range-end=true]:text-primary-foreground ui:group-data-[focused=true]/day:border-ring ui:group-data-[focused=true]/day:ring-ring/50 ui:dark:hover:text-accent-foreground ui:flex ui:aspect-square ui:size-auto ui:w-full ui:min-w-(--cell-size) ui:flex-col ui:gap-1 ui:leading-none ui:font-normal ui:group-data-[focused=true]/day:relative ui:group-data-[focused=true]/day:z-10 ui:group-data-[focused=true]/day:ring-[3px] ui:data-[range-end=true]:rounded-md ui:data-[range-end=true]:rounded-r-md ui:data-[range-middle=true]:rounded-none ui:data-[range-start=true]:rounded-md ui:data-[range-start=true]:rounded-l-md ui:[&>span]:text-xs ui:[&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
