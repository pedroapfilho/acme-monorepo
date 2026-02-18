import { Button, Input, Label } from "@repo/ui";
import { Meta, StoryObj } from "@storybook/react-vite";
import { Search, Eye, EyeOff, Mail, Lock, User, Phone, CreditCard, Calendar } from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof Input> = {
  title: "ui/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: [
        "text",
        "email",
        "password",
        "number",
        "tel",
        "url",
        "search",
        "date",
        "time",
        "datetime-local",
      ],
    },
    disabled: {
      control: { type: "boolean" },
    },
    readOnly: {
      control: { type: "boolean" },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const Types: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label>Text Input</Label>
        <Input type="text" placeholder="Enter text" />
      </div>
      <div className="space-y-2">
        <Label>Email Input</Label>
        <Input type="email" placeholder="Enter email" />
      </div>
      <div className="space-y-2">
        <Label>Password Input</Label>
        <Input type="password" placeholder="Enter password" />
      </div>
      <div className="space-y-2">
        <Label>Number Input</Label>
        <Input type="number" placeholder="Enter number" />
      </div>
      <div className="space-y-2">
        <Label>Phone Input</Label>
        <Input type="tel" placeholder="Enter phone number" />
      </div>
      <div className="space-y-2">
        <Label>URL Input</Label>
        <Input type="url" placeholder="https://example.com" />
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label>Normal</Label>
        <Input placeholder="Normal input" />
      </div>
      <div className="space-y-2">
        <Label>Disabled</Label>
        <Input placeholder="Disabled input" disabled />
      </div>
      <div className="space-y-2">
        <Label>Read-only</Label>
        <Input value="Read-only value" readOnly />
      </div>
      <div className="space-y-2">
        <Label>With Error</Label>
        <Input
          placeholder="Invalid input"
          className="border-destructive focus-visible:ring-destructive"
        />
        <p className="text-destructive text-sm">This field is required</p>
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label>Search</Label>
        <Input placeholder="Search..." startIcon={<Search />} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" placeholder="Email address" startIcon={<Mail />} />
      </div>
      <div className="space-y-2">
        <Label>Username</Label>
        <Input placeholder="Username" startIcon={<User />} />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input type="tel" placeholder="Phone number" startIcon={<Phone />} />
      </div>
    </div>
  ),
};

const PasswordInputRender = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label>Password with Toggle</Label>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          startIcon={<Lock />}
          endIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          }
        />
      </div>
    </div>
  );
};

export const PasswordInput: Story = {
  render: () => <PasswordInputRender />,
};

export const Sizes: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label>Small</Label>
        <Input placeholder="Small input" className="h-8 text-sm" />
      </div>
      <div className="space-y-2">
        <Label>Default</Label>
        <Input placeholder="Default input" />
      </div>
      <div className="space-y-2">
        <Label>Large</Label>
        <Input placeholder="Large input" className="h-12 text-base" />
      </div>
    </div>
  ),
};

export const WithLabelsAndHelp: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" placeholder="john@example.com" />
        <p className="text-muted-foreground text-sm">
          We&apos;ll never share your email with anyone else.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" placeholder="Choose a username" />
        <p className="text-muted-foreground text-sm">
          This will be your unique identifier on the platform.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" type="url" placeholder="https://yoursite.com" />
        <p className="text-muted-foreground text-sm">
          Optional: Link to your personal or professional website.
        </p>
      </div>
    </div>
  ),
};

export const InputGroups: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="space-y-2">
        <Label>Email Subscription</Label>
        <div className="flex">
          <Input type="email" placeholder="Enter email" className="rounded-r-none" />
          <Button type="submit" className="rounded-l-none">
            Subscribe
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Search</Label>
        <div className="flex">
          <Input placeholder="Search products..." className="rounded-r-none" />
          <Button type="submit" variant="outline" className="rounded-l-none">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Amount</Label>
        <div className="flex">
          <div className="text-muted-foreground bg-muted border-input inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm">
            $
          </div>
          <Input type="number" placeholder="0.00" className="rounded-l-none" step="0.01" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Website URL</Label>
        <div className="flex">
          <div className="text-muted-foreground bg-muted border-input inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm">
            https://
          </div>
          <Input placeholder="example.com" className="rounded-l-none" />
        </div>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <p className="text-muted-foreground text-sm">Please provide your contact details.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Doe" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="john@example.com" startIcon={<Mail />} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" startIcon={<Phone />} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" placeholder="Acme Inc." />
      </div>

      <Button className="w-full">Submit</Button>
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="space-y-2">
        <Label>Valid Input</Label>
        <Input
          placeholder="Valid input"
          className="border-green-500 focus-visible:ring-green-500"
        />
        <p className="text-sm text-green-600">✓ This field is valid</p>
      </div>

      <div className="space-y-2">
        <Label>Invalid Input</Label>
        <Input
          placeholder="Invalid input"
          className="border-destructive focus-visible:ring-destructive"
        />
        <p className="text-destructive text-sm">✗ This field is required</p>
      </div>

      <div className="space-y-2">
        <Label>Warning Input</Label>
        <Input
          placeholder="Warning input"
          className="border-yellow-500 focus-visible:ring-yellow-500"
        />
        <p className="text-sm text-yellow-600">⚠ Please double-check this field</p>
      </div>
    </div>
  ),
};

export const SpecialInputs: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label>Credit Card</Label>
        <Input placeholder="1234 5678 9012 3456" startIcon={<CreditCard />} maxLength={19} />
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" startIcon={<Calendar />} />
      </div>

      <div className="space-y-2">
        <Label>Time</Label>
        <Input type="time" />
      </div>

      <div className="space-y-2">
        <Label>File Upload</Label>
        <Input
          type="file"
          className="file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium"
        />
      </div>
    </div>
  ),
};

export const IconExamples: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label>Start Icon Only</Label>
        <Input placeholder="Search..." startIcon={<Search />} />
      </div>
      <div className="space-y-2">
        <Label>End Icon Only</Label>
        <Input
          placeholder="Copy to clipboard"
          endIcon={
            <button className="text-muted-foreground hover:text-foreground">
              <Search />
            </button>
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Both Icons</Label>
        <Input
          placeholder="Search and clear"
          startIcon={<Search />}
          endIcon={
            <button className="text-muted-foreground hover:text-foreground">
              <Eye />
            </button>
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Interactive End Icon</Label>
        <Input
          type="password"
          placeholder="Password with visibility toggle"
          startIcon={<Lock />}
          endIcon={
            <button className="text-muted-foreground hover:text-foreground">
              <EyeOff />
            </button>
          }
        />
      </div>
    </div>
  ),
};

export const FormWithIcons: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Enhanced Form</h3>
        <p className="text-muted-foreground text-sm">
          All inputs with relevant icons for better UX.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input placeholder="John" startIcon={<User />} />
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input placeholder="Doe" startIcon={<User />} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" placeholder="john@example.com" startIcon={<Mail />} />
      </div>

      <div className="space-y-2">
        <Label>Phone</Label>
        <Input type="tel" placeholder="+1 (555) 123-4567" startIcon={<Phone />} />
      </div>

      <div className="space-y-2">
        <Label>Password</Label>
        <Input
          type="password"
          placeholder="Enter password"
          startIcon={<Lock />}
          endIcon={
            <button className="text-muted-foreground hover:text-foreground">
              <Eye />
            </button>
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Credit Card</Label>
        <Input placeholder="1234 5678 9012 3456" startIcon={<CreditCard />} maxLength={19} />
      </div>

      <Button className="w-full">Submit</Button>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    placeholder: "Playground input",
    type: "text",
    disabled: false,
  },
};
