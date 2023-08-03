import type { Meta, StoryObj } from "@storybook/react";

import { CodeInput } from "ui";

type Story = StoryObj<typeof CodeInput>;

const meta = {
  component: CodeInput,
} satisfies Meta<typeof CodeInput>;

const EXPECTED = "123456";

const Playground: Story = {
  args: {
    id: "code-input",
    length: 6,
    onSubmit: (value: string) =>
      new Promise<boolean>((resolve) => {
        setTimeout(() => {
          resolve(value === EXPECTED);
        }, 1000);
      }),
    onSuccess: () => {
      alert("asdasd!");
    },
  },
};

export { Playground };

export default meta;
