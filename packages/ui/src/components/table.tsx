import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

const Table = ({ className, ...props }: ComponentProps<"table">) => {
  return (
    <div className="relative w-full overflow-x-auto" data-slot="table-container">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        data-slot="table"
        {...props}
      />
    </div>
  );
};

const TableHeader = ({ className, ...props }: ComponentProps<"thead">) => {
  return <thead className={cn("[&_tr]:border-b", className)} data-slot="table-header" {...props} />;
};

const TableBody = ({ className, ...props }: ComponentProps<"tbody">) => {
  return (
    <tbody
      className={cn("[&_tr:last-child]:border-0", className)}
      data-slot="table-body"
      {...props}
    />
  );
};

const TableFooter = ({ className, ...props }: ComponentProps<"tfoot">) => {
  return (
    <tfoot
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      data-slot="table-footer"
      {...props}
    />
  );
};

const TableRow = ({ className, ...props }: ComponentProps<"tr">) => {
  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      data-slot="table-row"
      {...props}
    />
  );
};

const TableHead = ({ className, ...props }: ComponentProps<"th">) => {
  return (
    <th
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      data-slot="table-head"
      {...props}
    />
  );
};

const TableCell = ({ className, ...props }: ComponentProps<"td">) => {
  return (
    <td
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      data-slot="table-cell"
      {...props}
    />
  );
};

const TableCaption = ({ className, ...props }: ComponentProps<"caption">) => {
  return (
    <caption
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      data-slot="table-caption"
      {...props}
    />
  );
};

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
