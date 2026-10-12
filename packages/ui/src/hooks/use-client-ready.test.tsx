import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

import { useClientReady } from "./use-client-ready";

const Control = () => {
  const ready = useClientReady();
  return <input aria-label="Email" disabled={!ready} />;
};

it("keeps a server-rendered control disabled until it hydrates", () => {
  const container = document.createElement("div");
  container.innerHTML = renderToString(<Control />);
  const input = container.querySelector("input");
  expect(input?.disabled).toBe(true);

  act(() => {
    hydrateRoot(container, <Control />);
  });
  expect(input?.disabled).toBe(false);
});
