"use client";

import { useRef, useTransition } from "react";

type SubmittableForm = {
  handleSubmit: () => Promise<void>;
};

/**
 * `isPending` only starts at `startTransition`, i.e. after validation, so the ref covers the gap
 * from the click. Both exits clear it unconditionally: keying the release off form validity leaves
 * the latch stuck, and the form permanently unsubmittable, whenever a validator throws.
 */
const useAuthSubmit = () => {
  const [isPending, startTransition] = useTransition();
  const isLatched = useRef(false);
  const didRun = useRef(false);

  const run = (work: () => Promise<void>) => {
    didRun.current = true;
    startTransition(async () => {
      try {
        await work();
      } finally {
        isLatched.current = false;
      }
    });
  };

  const submit = async (form: SubmittableForm) => {
    if (isPending || isLatched.current) {
      return;
    }
    isLatched.current = true;
    didRun.current = false;
    try {
      await form.handleSubmit();
    } finally {
      if (!didRun.current) {
        isLatched.current = false;
      }
    }
  };

  return { isPending, run, submit };
};

export { useAuthSubmit };
