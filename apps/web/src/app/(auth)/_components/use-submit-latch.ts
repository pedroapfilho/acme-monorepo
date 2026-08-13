"use client";

import { useRef } from "react";

type SubmitLatchOptions = {
  isPending: boolean;
  isValid: () => boolean;
  submit: () => Promise<void>;
};

const useSubmitLatch = () => {
  const isLatched = useRef(false);

  const release = () => {
    isLatched.current = false;
  };

  const run = async ({ isPending, isValid, submit }: SubmitLatchOptions) => {
    if (isPending || isLatched.current) {
      return;
    }

    isLatched.current = true;
    try {
      await submit();
    } finally {
      if (!isValid()) {
        release();
      }
    }
  };

  return { release, run };
};

export { useSubmitLatch };
export type { SubmitLatchOptions };
