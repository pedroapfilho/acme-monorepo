const hours = new Intl.NumberFormat("en-US", { style: "unit", unit: "hour", unitDisplay: "long" });

const formatHours = (value: number): string => hours.format(value);

export { formatHours };
