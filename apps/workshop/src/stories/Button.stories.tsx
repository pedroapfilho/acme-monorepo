import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "ui";

type Story = StoryObj<typeof Button>;

const meta = {
  component: Button,
} satisfies Meta<typeof Button>;

const Playground: Story = {
  args: {
    children: "Playground",
  },
};

const Disabled: Story = {
  args: {
    children: "Default",
    disabled: true,
  },
};

export { Playground, Disabled };

export default meta;
