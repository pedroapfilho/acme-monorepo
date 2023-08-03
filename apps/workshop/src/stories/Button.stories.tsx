import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "ui";

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
    children: "Default",
    variant: "default",
    size: "default",
  },
};

const Disabled: Story = {
  args: {
    children: "Default",
    variant: "default",
    size: "default",
    disabled: true,
  },
};

const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  },
};

const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

const Subtle: Story = {
  args: {
    children: "Subtle",
    variant: "subtle",
  },
};

const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};

const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
};

const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export {
  Playground,
  Disabled,
  Destructive,
  Outline,
  Subtle,
  Ghost,
  Link,
  Large,
  Small,
};

export default meta;
