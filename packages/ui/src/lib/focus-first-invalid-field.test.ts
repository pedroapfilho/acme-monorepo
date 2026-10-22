import { afterEach, describe, expect, it } from "vitest";

import { focusFirstInvalidField } from "./focus-first-invalid-field";

const nextFrame = () =>
  new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });

afterEach(() => {
  document.body.replaceChildren();
});

describe("focusFirstInvalidField", () => {
  it("focuses the form's first invalid control once it is enabled in the next frame", async () => {
    document.body.innerHTML = `
      <input aria-invalid="true" id="outside" />
      <form id="signup">
        <input aria-invalid="false" id="name" />
        <input aria-invalid="true" disabled id="email" />
        <input aria-invalid="true" id="password" />
      </form>`;
    const email = document.querySelector("#email");

    focusFirstInvalidField("signup");
    email?.removeAttribute("disabled");
    await nextFrame();

    expect(document.activeElement).toBe(email);
  });

  it("does nothing when the form is gone", async () => {
    focusFirstInvalidField("missing");
    await nextFrame();

    expect(document.activeElement).toBe(document.body);
  });
});
