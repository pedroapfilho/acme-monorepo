"use client";

import type { ComponentProps } from "react";

import { useClientReady } from "../hooks/use-client-ready";

const ClientReadyForm = ({ children, ...props }: ComponentProps<"form">) => {
  const ready = useClientReady();

  return (
    <form {...props}>
      <fieldset className="contents" disabled={!ready}>
        {children}
      </fieldset>
    </form>
  );
};

export { ClientReadyForm };
