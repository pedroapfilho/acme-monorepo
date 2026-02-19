"use client";

import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

const Table = ({ className, ...props }: ComponentProps<"table">) => {
  return (
    <div className="ui:relative ui:w-full ui:overflow-x-auto" data-slot="table-container">
      <table
        className={cn("ui:w-full ui:caption-bottom ui:text-sm", className)}
        data-slot="table"
        {...props}
      />
    </div>
  );
};

const TableHeader = ({ className, ...props }: ComponentProps<"thead">) => {
  return (
    <thead className={cn("ui:[&_tr]:border-b", className)} data-slot="table-header" {...props} />
  );
};

const TableBody = ({ className, ...props }: ComponentProps<"tbody">) => {
  return (
    <tbody
      className={cn("ui:[&_tr:last-child]:border-0", className)}
      data-slot="table-body"
      {...props}
    />
  );
};

const TableFooter = ({ className, ...props }: ComponentProps<"tfoot">) => {
  return (
    <tfoot
      className={cn(
        "ui:bg-muted/50 ui:border-t ui:font-medium ui:[&>tr]:last:border-b-0",
        className,
      )}
      data-slot="table-footer"
      {...props}
    />
  );
};

const TableRow = ({ className, ...props }: ComponentProps<"tr">) => {
  return (
    <tr
      className={cn(
        "ui:hover:bg-muted/50 ui:data-[state=selected]:bg-muted ui:border-b ui:transition-colors",
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
        "ui:text-foreground ui:h-10 ui:px-2 ui:text-left ui:align-middle ui:font-medium ui:whitespace-nowrap ui:[&:has([role=checkbox])]:pr-0 ui:[&>[role=checkbox]]:translate-y-[2px]",
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
        "ui:p-2 ui:align-middle ui:whitespace-nowrap ui:[&:has([role=checkbox])]:pr-0 ui:[&>[role=checkbox]]:translate-y-[2px]",
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
      className={cn("ui:text-muted-foreground ui:mt-4 ui:text-sm", className)}
      data-slot="table-caption"
      {...props}
    />
  );
};

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
