import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "ui";

type Story = StoryObj<typeof Input>;

const meta = {
  component: Input,
} satisfies Meta<typeof Input>;

const Text: Story = {
  args: {
    type: "text",
    placeholder: "Text",
  },
};

const Disabled: Story = {
  args: {
    type: "text",
    placeholder: "Text",
    disabled: true,
  },
};

const Number: Story = {
  args: {
    type: "number",
    placeholder: "Number",
  },
};

const Password: Story = {
  args: {
    type: "password",
    placeholder: "Password",
  },
};

const File: Story = {
  args: {
    type: "file",
    placeholder: "File",
  },
};

const Date: Story = {
  args: {
    type: "date",
    placeholder: "Date",
  },
};

export { Text, Disabled, Number, Password, File, Date };

export default meta;
