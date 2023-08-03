import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox, Label } from "ui";

type Story = StoryObj<typeof Checkbox>;

const meta = {
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

const Playground: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" disabled />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export { Playground, Disabled };

export default meta;
