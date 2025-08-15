import { Badge } from "@repo/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Badge> = {
  title: "ui/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "secondary", "destructive", "outline"],
    },
    asChild: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: {
    children: "Badge",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        Success
      </Badge>
      <Badge variant="destructive">
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        Error
      </Badge>
      <Badge variant="outline">
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Info
      </Badge>
    </div>
  ),
};

export const Numbers: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">1</Badge>
      <Badge variant="secondary">42</Badge>
      <Badge variant="destructive">999+</Badge>
      <Badge variant="outline">12</Badge>
    </div>
  ),
};

export const Status: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Cancelled</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  ),
};

export const AsLink: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge asChild variant="default">
        <a href="#" className="cursor-pointer">
          Clickable Badge
        </a>
      </Badge>
      <Badge asChild variant="outline">
        <a href="#" className="cursor-pointer">
          Link Badge
        </a>
      </Badge>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">User Profile</h3>
        <Badge variant="default">Pro</Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Email notifications</span>
        <Badge variant="secondary">Enabled</Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Account status</span>
        <Badge variant="destructive">Suspended</Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Subscription</span>
        <Badge variant="outline">Trial</Badge>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    children: "Playground Badge",
    variant: "default",
  },
};
