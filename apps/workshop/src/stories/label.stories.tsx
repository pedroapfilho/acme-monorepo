import { Meta, StoryObj } from "@storybook/react";
import { Mail, User, Lock, Phone, Calendar, DollarSign } from "lucide-react";

import { Label, Input, Checkbox, Button } from "@repo/ui";

const meta: Meta<typeof Label> = {
  title: "ui/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    htmlFor: {
      control: { type: "text" },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Your email address",
    htmlFor: "email",
  },
};

export const BasicUsage: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Enter your full name" />
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="email-icon" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Address
        </Label>
        <Input id="email-icon" type="email" placeholder="Enter your email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-icon" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Username
        </Label>
        <Input id="user-icon" placeholder="Choose a username" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-icon" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Password
        </Label>
        <Input
          id="password-icon"
          type="password"
          placeholder="Enter password"
        />
      </div>
    </div>
  ),
};

export const WithHelpText: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" placeholder="johndoe" />
        <p className="text-sm text-muted-foreground">
          This will be your unique identifier on the platform.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-help">Email Address</Label>
        <Input id="email-help" type="email" placeholder="john@example.com" />
        <p className="text-sm text-muted-foreground">
          We'll never share your email with anyone else.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
        <p className="text-sm text-muted-foreground">
          Optional: Used for account recovery and notifications.
        </p>
      </div>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="required-name">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input id="required-name" placeholder="Enter your full name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="required-email">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="required-email"
          type="email"
          placeholder="Enter your email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="optional-phone">Phone Number</Label>
        <Input id="optional-phone" type="tel" placeholder="Optional" />
      </div>
    </div>
  ),
};

export const ErrorStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="error-email" className="text-destructive">
          Email Address
        </Label>
        <Input
          id="error-email"
          type="email"
          placeholder="Enter your email"
          className="border-destructive focus-visible:ring-destructive"
        />
        <p className="text-sm text-destructive">
          Please enter a valid email address
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="error-password" className="text-destructive">
          Password
        </Label>
        <Input
          id="error-password"
          type="password"
          placeholder="Enter password"
          className="border-destructive focus-visible:ring-destructive"
        />
        <p className="text-sm text-destructive">
          Password must be at least 8 characters
        </p>
      </div>
    </div>
  ),
};

export const WithCheckboxes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">
          I agree to the{" "}
          <a href="#" className="underline">
            terms and conditions
          </a>
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="marketing" />
        <Label htmlFor="marketing">I want to receive marketing emails</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="newsletter" />
        <Label htmlFor="newsletter">
          Subscribe to our newsletter for updates
        </Label>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="small" className="text-sm">
          Small Label
        </Label>
        <Input id="small" className="h-8 text-sm" placeholder="Small input" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="default-size">Default Label</Label>
        <Input id="default-size" placeholder="Default input" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="large" className="text-lg">
          Large Label
        </Label>
        <Input
          id="large"
          className="h-12 text-base"
          placeholder="Large input"
        />
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Create Account</h3>
        <p className="text-sm text-muted-foreground">
          Fill out the form below to create your account
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first-name">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input id="first-name" placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input id="last-name" placeholder="Doe" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input id="form-email" type="email" placeholder="john@example.com" />
        <p className="text-sm text-muted-foreground">
          This will be used to sign in to your account
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Phone Number
        </Label>
        <Input id="form-phone" type="tel" placeholder="+1 (555) 123-4567" />
        <p className="text-sm text-muted-foreground">
          Optional: For account recovery
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-password" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Password <span className="text-destructive">*</span>
        </Label>
        <Input id="form-password" type="password" placeholder="••••••••" />
        <p className="text-sm text-muted-foreground">
          Must be at least 8 characters with numbers and letters
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="form-terms" />
          <Label htmlFor="form-terms" className="text-sm">
            I agree to the{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="form-marketing" />
          <Label htmlFor="form-marketing" className="text-sm">
            Send me product updates and marketing emails
          </Label>
        </div>
      </div>

      <Button className="w-full">Create Account</Button>
    </div>
  ),
};

export const SpecialCases: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-2">
        <Label htmlFor="date" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Birth Date
        </Label>
        <Input id="date" type="date" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Amount
        </Label>
        <div className="flex">
          <div className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md">
            $
          </div>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            className="rounded-l-none"
            step="0.01"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Profile Picture</Label>
        <Input
          id="file"
          type="file"
          accept="image/*"
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
        <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Tell us about yourself..."
        />
        <p className="text-sm text-muted-foreground">
          Brief description for your profile
        </p>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    children: "Playground Label",
    htmlFor: "playground",
  },
  render: (args) => (
    <div className="space-y-2">
      <Label {...args} />
      <Input id="playground" placeholder="Associated input" />
    </div>
  ),
};
