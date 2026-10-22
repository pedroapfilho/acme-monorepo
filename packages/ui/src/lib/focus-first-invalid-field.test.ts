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

  it("focuses the first control inside an invalid group, such as a radio group", async () => {
    document.body.innerHTML = `
      <form id="decision">
        <div aria-invalid="true" role="radiogroup">
          <input id="approve" name="decision" type="radio" />
          <input id="reject" name="decision" type="radio" />
        </div>
      </form>`;

    focusFirstInvalidField("decision");
    await nextFrame();

    expect(document.activeElement).toBe(document.querySelector("#approve"));
  });

  it("does nothing when the form is gone", async () => {
    focusFirstInvalidField("missing");
    await nextFrame();

    expect(document.activeElement).toBe(document.body);
  });
});
