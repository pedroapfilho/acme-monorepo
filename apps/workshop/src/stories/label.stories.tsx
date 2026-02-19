import { Label, Input, Checkbox, Button } from "@repo/ui";
import { Meta, StoryObj } from "@storybook/react-vite";
import { Mail, User, Lock, Phone, Calendar, DollarSign } from "lucide-react";

const meta: Meta<typeof Label> = {
  argTypes: {
    htmlFor: {
      control: { type: "text" },
    },
  },
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "ui/Label",
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
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" placeholder="Enter your email" type="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" placeholder="Enter your password" type="password" />
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
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2" htmlFor="email-icon">
          <Mail className="h-4 w-4" />
          Email Address
        </Label>
        <Input id="email-icon" placeholder="Enter your email" type="email" />
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2" htmlFor="user-icon">
          <User className="h-4 w-4" />
          Username
        </Label>
        <Input id="user-icon" placeholder="Choose a username" />
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2" htmlFor="password-icon">
          <Lock className="h-4 w-4" />
          Password
        </Label>
        <Input id="password-icon" placeholder="Enter password" type="password" />
      </div>
    </div>
  ),
};

export const WithHelpText: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" placeholder="johndoe" />
        <p className="text-sm text-muted-foreground">
          This will be your unique identifier on the platform.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-help">Email Address</Label>
        <Input id="email-help" placeholder="john@example.com" type="email" />
        <p className="text-sm text-muted-foreground">
          We&apos;ll never share your email with anyone else.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" placeholder="+1 (555) 123-4567" type="tel" />
        <p className="text-sm text-muted-foreground">
          Optional: Used for account recovery and notifications.
        </p>
      </div>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="w-80 space-y-4">
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
        <Input id="required-email" placeholder="Enter your email" type="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="optional-phone">Phone Number</Label>
        <Input id="optional-phone" placeholder="Optional" type="tel" />
      </div>
    </div>
  ),
};

export const ErrorStates: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label className="text-destructive" htmlFor="error-email">
          Email Address
        </Label>
        <Input
          className="border-destructive focus-visible:ring-destructive"
          id="error-email"
          placeholder="Enter your email"
          type="email"
        />
        <p className="text-sm text-destructive">Please enter a valid email address</p>
      </div>
      <div className="space-y-2">
        <Label className="text-destructive" htmlFor="error-password">
          Password
        </Label>
        <Input
          className="border-destructive focus-visible:ring-destructive"
          id="error-password"
          placeholder="Enter password"
          type="password"
        />
        <p className="text-sm text-destructive">Password must be at least 8 characters</p>
      </div>
    </div>
  ),
};

export const WithCheckboxes: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">
          I agree to the{" "}
          <a className="underline" href="/terms">
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
        <Label htmlFor="newsletter">Subscribe to our newsletter for updates</Label>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label className="text-sm" htmlFor="small">
          Small Label
        </Label>
        <Input className="h-8 text-sm" id="small" placeholder="Small input" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="default-size">Default Label</Label>
        <Input id="default-size" placeholder="Default input" />
      </div>
      <div className="space-y-2">
        <Label className="text-lg" htmlFor="large">
          Large Label
        </Label>
        <Input className="h-12 text-base" id="large" placeholder="Large input" />
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
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
        <Label className="flex items-center gap-2" htmlFor="form-email">
          <Mail className="h-4 w-4" />
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input id="form-email" placeholder="john@example.com" type="email" />
        <p className="text-sm text-muted-foreground">
          This will be used to sign in to your account
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2" htmlFor="form-phone">
          <Phone className="h-4 w-4" />
          Phone Number
        </Label>
        <Input id="form-phone" placeholder="+1 (555) 123-4567" type="tel" />
        <p className="text-sm text-muted-foreground">Optional: For account recovery</p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2" htmlFor="form-password">
          <Lock className="h-4 w-4" />
          Password <span className="text-destructive">*</span>
        </Label>
        <Input id="form-password" placeholder="••••••••" type="password" />
        <p className="text-sm text-muted-foreground">
          Must be at least 8 characters with numbers and letters
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="form-terms" />
          <Label className="text-sm" htmlFor="form-terms">
            I agree to the{" "}
            <a className="underline" href="/terms-of-service">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="underline" href="/privacy-policy">
              Privacy Policy
            </a>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="form-marketing" />
          <Label className="text-sm" htmlFor="form-marketing">
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
    <div className="w-80 space-y-6">
      <div className="space-y-2">
        <Label className="flex items-center gap-2" htmlFor="date">
          <Calendar className="h-4 w-4" />
          Birth Date
        </Label>
        <Input id="date" type="date" />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2" htmlFor="amount">
          <DollarSign className="h-4 w-4" />
          Amount
        </Label>
        <div className="flex">
          <div className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
            $
          </div>
          <Input
            className="rounded-l-none"
            id="amount"
            placeholder="0.00"
            step="0.01"
            type="number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Profile Picture</Label>
        <Input
          accept="image/*"
          className="file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          id="file"
          type="file"
        />
        <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          id="bio"
          placeholder="Tell us about yourself..."
        />
        <p className="text-sm text-muted-foreground">Brief description for your profile</p>
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
