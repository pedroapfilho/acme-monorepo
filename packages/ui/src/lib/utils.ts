import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  experimentalParseClassName({ className, parseClassName }) {
    const parsed = parseClassName(className);

    if (parsed.baseClassName.startsWith("ui:")) {
      return {
        ...parsed,
        baseClassName: parsed.baseClassName.slice(3),
      };
    }

    return parsed;
  },
});

const cn = (...inputs: Array<ClassValue>) => {
  return twMerge(clsx(inputs));
};

export { cn };
