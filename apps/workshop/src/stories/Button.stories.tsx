import { Button } from "@repo/ui";
import type { Meta, StoryObj } from "@storybook/react";

type Story = StoryObj<typeof Button>;

const meta = {
  component: Button,
  argTypes: {
    variant: {
      options: ["default", "destructive", "outline", "subtle", "ghost", "link"],
      control: { type: "radio" },
    },
    size: {
      options: ["default", "sm", "lg"],
      control: { type: "radio" },
    },
  },
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

export { Disabled, Playground };

export default meta;
