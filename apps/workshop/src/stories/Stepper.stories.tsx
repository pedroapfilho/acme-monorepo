import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Stepper } from "ui";

type Story = StoryObj<typeof Stepper>;

const meta = {
  component: Stepper,
  decorators: [
    (Story) => (
      <div className="mx-auto flex max-w-xl rounded-md bg-white">
        <aside className="flex w-8 items-center justify-center border-r-2 p-8 sm:w-72 sm:px-0">
          <Story />
        </aside>
        <main className="p-8">
          <div className="w-72"> </div>
        </main>
      </div>
    ),
  ],
} satisfies Meta<typeof Stepper>;

const Playground: Story = {
  args: {
    steps: [
      "Connect Wallet",
      "Accept Terms",
      "Enroll MFA",
      "Enter Identity Data",
      "Verify Identity",
      "Mint Token",
    ],
    activeStep: 1,
  },
};

export { Playground };

export default meta;
