import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "ui";

type Story = StoryObj<typeof Label>;

const meta = {
  component: Label,
} satisfies Meta<typeof Label>;

const Playground: Story = {
  args: {
    children: "Label",
  },
};

export { Playground };

export default meta;
