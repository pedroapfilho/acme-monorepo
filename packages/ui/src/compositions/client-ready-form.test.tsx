import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

import { ClientReadyForm } from "./client-ready-form";

const Form = () => (
  <ClientReadyForm aria-label="Sign in">
    <input aria-label="Email" />
    <button type="submit">Sign in</button>
  </ClientReadyForm>
);

it("keeps every control of a server-rendered form disabled until it hydrates", () => {
  const container = document.createElement("div");
  container.innerHTML = renderToString(<Form />);
  const input = container.querySelector("input");
  const button = container.querySelector("button");
  expect(input?.matches(":disabled")).toBe(true);
  expect(button?.matches(":disabled")).toBe(true);

  act(() => {
    hydrateRoot(container, <Form />);
  });
  expect(input?.matches(":disabled")).toBe(false);
  expect(button?.matches(":disabled")).toBe(false);
});
