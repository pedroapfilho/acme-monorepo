import { Button } from "@repo/ui";
import { Meta, StoryObj } from "@storybook/react-vite";
import {
  Loader2,
  Mail,
  Download,
  Plus,
  Trash2,
  Edit,
  Save,
  Share,
  Heart,
  ChevronDown,
  Settings,
  Search,
  ArrowRight,
} from "lucide-react";

const meta: Meta<typeof Button> = {
  argTypes: {
    asChild: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
    },
    variant: {
      control: { type: "select" },
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
  },
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "ui/Button",
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Mail className="mr-2 h-4 w-4" />
        Email
      </Button>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button variant="secondary">
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
      <Button variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button size="icon" variant="default">
        <Edit className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="outline">
        <Share className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="secondary">
        <Settings className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <Heart className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
      <Button disabled variant="outline">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Saving...
      </Button>
      <Button disabled variant="secondary">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button>Normal</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex gap-4">
        <Button variant="outline">Normal</Button>
        <Button disabled variant="outline">
          Disabled
        </Button>
      </div>
      <div className="flex gap-4">
        <Button variant="secondary">Normal</Button>
        <Button disabled variant="secondary">
          Disabled
        </Button>
      </div>
    </div>
  ),
};

export const AsChild: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button asChild>
        <a className="cursor-pointer" href="/example">
          Link Button
        </a>
      </Button>
      <Button asChild variant="outline">
        <a className="cursor-pointer" href="/downloads">
          <Download className="mr-2 h-4 w-4" />
          Download Link
        </a>
      </Button>
    </div>
  ),
};

export const ButtonGroups: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="flex">
        <Button className="rounded-r-none border-r-0" variant="outline">
          Left
        </Button>
        <Button className="rounded-none border-r-0" variant="outline">
          Center
        </Button>
        <Button className="rounded-l-none" variant="outline">
          Right
        </Button>
      </div>

      <div className="flex">
        <Button className="rounded-r-none border-r-0" size="sm" variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button className="rounded-none border-r-0" size="sm" variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button className="rounded-l-none" size="sm" variant="outline">
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  ),
};

export const DropdownButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div className="flex">
        <Button>Actions</Button>
        <Button className="ml-px rounded-l-none px-2" size="icon" variant="default">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button className="ml-px rounded-l-none px-2" size="icon" variant="outline">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ),
};

export const ActionButtons: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Primary Actions</h3>
        <div className="flex gap-3">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Destructive Actions</h3>
        <div className="flex gap-3">
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
          <Button variant="outline">Keep Account</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Search & Navigation</h3>
        <div className="flex gap-3">
          <Button variant="secondary">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="ghost">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <Button className="w-full">Sign In</Button>
      <Button className="w-full" variant="outline">
        <Mail className="mr-2 h-4 w-4" />
        Sign in with Email
      </Button>
      <Button className="w-full" variant="secondary">
        Create Account
      </Button>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="max-w-2xl space-y-8">
      {/* Card with buttons */}
      <div className="space-y-4 rounded-lg border border-border p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Project Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your project configuration and preferences.
          </p>
        </div>
        <div className="flex gap-3">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="icon" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form with buttons */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="context-email">
            Email Address
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            id="context-email"
            placeholder="Enter your email"
            type="email"
          />
        </div>
        <div className="flex gap-3">
          <Button className="flex-1">Subscribe</Button>
          <Button variant="outline">Maybe Later</Button>
        </div>
      </div>

      {/* Alert with buttons */}
      <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
        <div className="space-y-1">
          <h4 className="font-medium text-destructive">Delete Project</h4>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete your project.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="sm" variant="destructive">
            Yes, Delete Project
          </Button>
          <Button size="sm" variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    children: "Playground Button",
    disabled: false,
    size: "default",
    variant: "default",
  },
};
