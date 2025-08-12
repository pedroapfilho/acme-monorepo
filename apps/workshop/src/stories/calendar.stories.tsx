import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@repo/ui/components/calendar";
import { useState } from "react";

const meta: Meta<typeof Calendar> = {
  title: "ui/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: { type: "select" },
      options: ["single", "multiple", "range"],
    },
    showOutsideDays: {
      control: { type: "boolean" },
    },
    captionLayout: {
      control: { type: "select" },
      options: ["label", "dropdown", "dropdown-months", "dropdown-years"],
    },
    buttonVariant: {
      control: { type: "select" },
      options: ["default", "outline", "ghost", "link"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    mode: "single",
    showOutsideDays: true,
  },
};

export const SingleSelection: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Selected: {date ? date.toLocaleDateString() : "None"}
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>
    );
  },
};

export const MultipleSelection: Story = {
  render: () => {
    const [dates, setDates] = useState<Date[]>([]);

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Selected: {dates.length} date{dates.length !== 1 ? "s" : ""}
          {dates.length > 0 && (
            <div className="mt-1">
              {dates.map((date) => date.toLocaleDateString()).join(", ")}
            </div>
          )}
        </div>
        <Calendar
          mode="multiple"
          selected={dates}
          onSelect={setDates as any}
          className="rounded-md border"
        />
      </div>
    );
  },
};

export const RangeSelection: Story = {
  render: () => {
    const [range, setRange] = useState<{ from: Date; to?: Date } | undefined>();

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Range: {range?.from ? range.from.toLocaleDateString() : "None"} -{" "}
          {range?.to ? range.to.toLocaleDateString() : "None"}
        </div>
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange as any}
          className="rounded-md border"
        />
      </div>
    );
  },
};

export const WithDropdowns: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Calendar with month/year dropdowns
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          fromYear={2020}
          toYear={2030}
          className="rounded-md border"
        />
      </div>
    );
  },
};

export const WithoutOutsideDays: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Calendar without outside days
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          showOutsideDays={false}
          className="rounded-md border"
        />
      </div>
    );
  },
};

export const DisabledDates: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();

    const disabledDays = [
      { before: new Date() }, // Disable past dates
      { dayOfWeek: [0, 6] }, // Disable weekends
    ];

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Weekends and past dates are disabled
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={disabledDays}
          className="rounded-md border"
        />
      </div>
    );
  },
};

export const CustomModifiers: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();

    const bookedDays = [
      new Date(2024, 11, 8),
      new Date(2024, 11, 9),
      new Date(2024, 11, 15),
      new Date(2024, 11, 16),
    ];

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Calendar with booked dates highlighted
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          modifiers={{
            booked: bookedDays,
          }}
          modifiersClassNames={{
            booked: "bg-red-100 text-red-900 line-through",
          }}
          className="rounded-md border"
        />
        <div className="text-xs text-muted-foreground">
          Red dates are booked and cannot be selected
        </div>
      </div>
    );
  },
};

export const WeekNumbers: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Calendar with week numbers
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          showWeekNumber
          className="rounded-md border"
        />
      </div>
    );
  },
};

export const MultipleMonths: Story = {
  render: () => {
    const [range, setRange] = useState<{ from: Date; to?: Date } | undefined>();

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Two months for range selection
        </div>
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange as any}
          numberOfMonths={2}
          className="rounded-md border"
        />
      </div>
    );
  },
};

export const DatePicker: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Date picker example with input
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={date ? date.toLocaleDateString() : ""}
            placeholder="Select a date"
            readOnly
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          />
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
      </div>
    );
  },
};

export const BookingCalendar: Story = {
  render: () => {
    const [range, setRange] = useState<{ from: Date; to?: Date } | undefined>();

    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const bookedRanges = [
      {
        from: new Date(2024, 11, 5),
        to: new Date(2024, 11, 7),
      },
      {
        from: new Date(2024, 11, 15),
        to: new Date(2024, 11, 18),
      },
    ];

    return (
      <div className="space-y-4 max-w-2xl">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Book Your Stay</h3>
          <div className="text-sm text-muted-foreground">
            {range?.from && range?.to ? (
              <>
                Check-in: {range.from.toLocaleDateString()} • Check-out:{" "}
                {range.to.toLocaleDateString()} • Duration:{" "}
                {Math.ceil(
                  (range.to.getTime() - range.from.getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                nights
              </>
            ) : (
              "Select your check-in and check-out dates"
            )}
          </div>
        </div>
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange as any}
          numberOfMonths={2}
          disabled={[{ before: today }, ...bookedRanges]}
          modifiers={{
            booked: bookedRanges.flatMap((range) => {
              const dates = [];
              const currentDate = new Date(range.from);
              while (currentDate <= range.to) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
              }
              return dates;
            }),
          }}
          modifiersClassNames={{
            booked: "bg-red-100 text-red-900 opacity-50",
          }}
          className="rounded-md border"
        />
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 rounded border"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    );
  },
};

export const Playground: Story = {
  args: {
    mode: "single",
    showOutsideDays: true,
    captionLayout: "label",
  },
  render: (args) => {
    const [selected, setSelected] = useState<any>();

    return (
      <Calendar
        {...args}
        selected={selected}
        onSelect={setSelected}
        className="rounded-md border"
      />
    );
  },
};
