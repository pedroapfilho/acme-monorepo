import { Meta, StoryObj } from "@storybook/react";
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

import { Button } from "@repo/ui/components/button";

const meta: Meta<typeof Button> = {
  title: "ui/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
    },
    disabled: {
      control: { type: "boolean" },
    },
    asChild: {
      control: { type: "boolean" },
    },
  },
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
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Saving...
      </Button>
      <Button variant="secondary" disabled>
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
        <Button variant="outline" disabled>
          Disabled
        </Button>
      </div>
      <div className="flex gap-4">
        <Button variant="secondary">Normal</Button>
        <Button variant="secondary" disabled>
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
        <a href="#" className="cursor-pointer">
          Link Button
        </a>
      </Button>
      <Button variant="outline" asChild>
        <a href="#" className="cursor-pointer">
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
        <Button variant="outline" className="rounded-r-none border-r-0">
          Left
        </Button>
        <Button variant="outline" className="rounded-none border-r-0">
          Center
        </Button>
        <Button variant="outline" className="rounded-l-none">
          Right
        </Button>
      </div>

      <div className="flex">
        <Button
          size="sm"
          variant="outline"
          className="rounded-r-none border-r-0"
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button size="sm" variant="outline" className="rounded-none border-r-0">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button size="sm" variant="outline" className="rounded-l-none">
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
        <Button
          variant="default"
          size="icon"
          className="ml-px rounded-l-none px-2"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="ml-px rounded-l-none px-2"
        >
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
    <div className="space-y-4 max-w-md">
      <Button className="w-full">Sign In</Button>
      <Button variant="outline" className="w-full">
        <Mail className="mr-2 h-4 w-4" />
        Sign in with Email
      </Button>
      <Button variant="secondary" className="w-full">
        Create Account
      </Button>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-8 max-w-2xl">
      {/* Card with buttons */}
      <div className="border border-border rounded-lg p-6 space-y-4">
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
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form with buttons */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
          />
        </div>
        <div className="flex gap-3">
          <Button className="flex-1">Subscribe</Button>
          <Button variant="outline">Maybe Later</Button>
        </div>
      </div>

      {/* Alert with buttons */}
      <div className="border border-destructive/20 bg-destructive/10 rounded-lg p-4 space-y-3">
        <div className="space-y-1">
          <h4 className="font-medium text-destructive">Delete Project</h4>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete your
            project.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="destructive" size="sm">
            Yes, Delete Project
          </Button>
          <Button variant="outline" size="sm">
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
    variant: "default",
    size: "default",
    disabled: false,
  },
};
