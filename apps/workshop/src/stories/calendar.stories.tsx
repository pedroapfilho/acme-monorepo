import { Calendar } from "@repo/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

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

type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {
    mode: "single",
    showOutsideDays: true,
  },
};

const SingleSelectionRender = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">
        Selected: {date ? date.toLocaleDateString() : "None"}
      </div>
      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
    </div>
  );
};

export const SingleSelection: Story = {
  render: () => <SingleSelectionRender />,
};

const MultipleSelectionRender = () => {
  const [dates, setDates] = useState<Date[]>([]);

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">
        Selected: {dates.length} date{dates.length !== 1 ? "s" : ""}
        {dates.length > 0 && (
          <div className="mt-1">{dates.map((date) => date.toLocaleDateString()).join(", ")}</div>
        )}
      </div>
      <Calendar
        required
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        className="rounded-md border"
      />
    </div>
  );
};

export const MultipleSelection: Story = {
  render: () => <MultipleSelectionRender />,
};

const RangeSelectionRender = () => {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">
        Range: {range?.from ? range.from.toLocaleDateString() : "None"} -{" "}
        {range?.to ? range.to.toLocaleDateString() : "None"}
      </div>
      <Calendar mode="range" selected={range} onSelect={setRange} className="rounded-md border" />
    </div>
  );
};

export const RangeSelection: Story = {
  render: () => <RangeSelectionRender />,
};

const WithDropdownsRender = () => {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">Calendar with month/year dropdowns</div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        captionLayout="dropdown"
        startMonth={new Date(2020, 0)}
        endMonth={new Date(2030, 0)}
        className="rounded-md border"
      />
    </div>
  );
};

export const WithDropdowns: Story = {
  render: () => <WithDropdownsRender />,
};

const WithoutOutsideDaysRender = () => {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">Calendar without outside days</div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        showOutsideDays={false}
        className="rounded-md border"
      />
    </div>
  );
};

export const WithoutOutsideDays: Story = {
  render: () => <WithoutOutsideDaysRender />,
};

const DisabledDatesRender = () => {
  const [date, setDate] = useState<Date | undefined>();

  const disabledDays = [
    { before: new Date() }, // Disable past dates
    { dayOfWeek: [0, 6] }, // Disable weekends
  ];

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">Weekends and past dates are disabled</div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={disabledDays}
        className="rounded-md border"
      />
    </div>
  );
};

export const DisabledDates: Story = {
  render: () => <DisabledDatesRender />,
};

const CustomModifiersRender = () => {
  const [date, setDate] = useState<Date | undefined>();

  const bookedDays = [
    new Date(2024, 11, 8),
    new Date(2024, 11, 9),
    new Date(2024, 11, 15),
    new Date(2024, 11, 16),
  ];

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">Calendar with booked dates highlighted</div>
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
      <div className="text-muted-foreground text-xs">
        Red dates are booked and cannot be selected
      </div>
    </div>
  );
};

export const CustomModifiers: Story = {
  render: () => <CustomModifiersRender />,
};

const WeekNumbersRender = () => {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">Calendar with week numbers</div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        showWeekNumber
        className="rounded-md border"
      />
    </div>
  );
};

export const WeekNumbers: Story = {
  render: () => <WeekNumbersRender />,
};

const MultipleMonthsRender = () => {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">Two months for range selection</div>
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        numberOfMonths={2}
        className="rounded-md border"
      />
    </div>
  );
};

export const MultipleMonths: Story = {
  render: () => <MultipleMonthsRender />,
};

const DatePickerRender = () => {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">Date picker example with input</div>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={date ? date.toLocaleDateString() : ""}
          placeholder="Select a date"
          readOnly
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
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
};

export const DatePicker: Story = {
  render: () => <DatePickerRender />,
};

const BookingCalendarRender = () => {
  const [range, setRange] = useState<DateRange | undefined>();

  const today = new Date();

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
    <div className="max-w-2xl space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Book Your Stay</h3>
        <div className="text-muted-foreground text-sm">
          {range?.from && range?.to ? (
            <>
              Check-in: {range.from.toLocaleDateString()} • Check-out:{" "}
              {range.to.toLocaleDateString()} • Duration:{" "}
              {Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))}{" "}
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
        onSelect={setRange}
        numberOfMonths={2}
        disabled={[{ before: today }, ...bookedRanges]}
        modifiers={{
          booked: bookedRanges.flatMap((range) => {
            const dates = [];
            const currentDate = new Date(range.from);
            while (currentDate <= (range.to || range.from)) {
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
      <div className="text-muted-foreground flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border bg-red-100"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-primary h-3 w-3 rounded"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export const BookingCalendar: Story = {
  render: () => <BookingCalendarRender />,
};

export const Playground: Story = {
  args: {
    mode: "single",
    showOutsideDays: true,
    captionLayout: "label",
  },
  render: (args) => {
    return <Calendar {...args} className="rounded-md border" />;
  },
};
