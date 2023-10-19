import { ClassValue, clsx } from "clsx";
import { createTailwindMerge, getDefaultConfig } from "tailwind-merge";

const PREFIX = "ui";

const twMerge = createTailwindMerge(() => {
  const config = getDefaultConfig();

  return {
    ...config,
    classGroups: Object.fromEntries(
      Object.entries(config.classGroups).map(([key, value]) => {
        return [key, [...value, { [PREFIX]: value }]];
      }),
    ),
  };
});

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export { cn };
