import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "ui";

type Story = StoryObj<typeof Button>;

const meta: Meta<typeof Button> = {
  component: Button,
};

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

export { Disabled, Playground };

export default meta;
