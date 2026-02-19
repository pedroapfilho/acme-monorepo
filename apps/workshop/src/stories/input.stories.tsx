import { Button, Input, Label } from "@repo/ui";
import { Meta, StoryObj } from "@storybook/react-vite";
import { Search, Eye, EyeOff, Mail, Lock, User, Phone, CreditCard, Calendar } from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof Input> = {
  argTypes: {
    disabled: {
      control: { type: "boolean" },
    },
    readOnly: {
      control: { type: "boolean" },
    },
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
  },
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "ui/Input",
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
        <Input placeholder="Enter text" type="text" />
      </div>
      <div className="space-y-2">
        <Label>Email Input</Label>
        <Input placeholder="Enter email" type="email" />
      </div>
      <div className="space-y-2">
        <Label>Password Input</Label>
        <Input placeholder="Enter password" type="password" />
      </div>
      <div className="space-y-2">
        <Label>Number Input</Label>
        <Input placeholder="Enter number" type="number" />
      </div>
      <div className="space-y-2">
        <Label>Phone Input</Label>
        <Input placeholder="Enter phone number" type="tel" />
      </div>
      <div className="space-y-2">
        <Label>URL Input</Label>
        <Input placeholder="https://example.com" type="url" />
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
        <Input disabled placeholder="Disabled input" />
      </div>
      <div className="space-y-2">
        <Label>Read-only</Label>
        <Input readOnly value="Read-only value" />
      </div>
      <div className="space-y-2">
        <Label>With Error</Label>
        <Input
          className="border-destructive focus-visible:ring-destructive"
          placeholder="Invalid input"
        />
        <p className="text-sm text-destructive">This field is required</p>
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
        <Input placeholder="Email address" startIcon={<Mail />} type="email" />
      </div>
      <div className="space-y-2">
        <Label>Username</Label>
        <Input placeholder="Username" startIcon={<User />} />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input placeholder="Phone number" startIcon={<Phone />} type="tel" />
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
          endIcon={
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          }
          placeholder="Enter password"
          startIcon={<Lock />}
          type={showPassword ? "text" : "password"}
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
        <Input className="h-8 text-sm" placeholder="Small input" />
      </div>
      <div className="space-y-2">
        <Label>Default</Label>
        <Input placeholder="Default input" />
      </div>
      <div className="space-y-2">
        <Label>Large</Label>
        <Input className="h-12 text-base" placeholder="Large input" />
      </div>
    </div>
  ),
};

export const WithLabelsAndHelp: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" placeholder="john@example.com" type="email" />
        <p className="text-sm text-muted-foreground">
          We&apos;ll never share your email with anyone else.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" placeholder="Choose a username" />
        <p className="text-sm text-muted-foreground">
          This will be your unique identifier on the platform.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" placeholder="https://yoursite.com" type="url" />
        <p className="text-sm text-muted-foreground">
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
          <Input className="rounded-r-none" placeholder="Enter email" type="email" />
          <Button className="rounded-l-none" type="submit">
            Subscribe
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Search</Label>
        <div className="flex">
          <Input className="rounded-r-none" placeholder="Search products..." />
          <Button className="rounded-l-none" type="submit" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Amount</Label>
        <div className="flex">
          <div className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
            $
          </div>
          <Input className="rounded-l-none" placeholder="0.00" step="0.01" type="number" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Website URL</Label>
        <div className="flex">
          <div className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
            https://
          </div>
          <Input className="rounded-l-none" placeholder="example.com" />
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
        <p className="text-sm text-muted-foreground">Please provide your contact details.</p>
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
        <Input id="email" placeholder="john@example.com" startIcon={<Mail />} type="email" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" placeholder="+1 (555) 123-4567" startIcon={<Phone />} type="tel" />
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
          className="border-green-500 focus-visible:ring-green-500"
          placeholder="Valid input"
        />
        <p className="text-sm text-green-600">✓ This field is valid</p>
      </div>

      <div className="space-y-2">
        <Label>Invalid Input</Label>
        <Input
          className="border-destructive focus-visible:ring-destructive"
          placeholder="Invalid input"
        />
        <p className="text-sm text-destructive">✗ This field is required</p>
      </div>

      <div className="space-y-2">
        <Label>Warning Input</Label>
        <Input
          className="border-yellow-500 focus-visible:ring-yellow-500"
          placeholder="Warning input"
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
        <Input maxLength={19} placeholder="1234 5678 9012 3456" startIcon={<CreditCard />} />
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Input startIcon={<Calendar />} type="date" />
      </div>

      <div className="space-y-2">
        <Label>Time</Label>
        <Input type="time" />
      </div>

      <div className="space-y-2">
        <Label>File Upload</Label>
        <Input
          className="file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          type="file"
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
          endIcon={
            <button className="text-muted-foreground hover:text-foreground">
              <Search />
            </button>
          }
          placeholder="Copy to clipboard"
        />
      </div>
      <div className="space-y-2">
        <Label>Both Icons</Label>
        <Input
          endIcon={
            <button className="text-muted-foreground hover:text-foreground">
              <Eye />
            </button>
          }
          placeholder="Search and clear"
          startIcon={<Search />}
        />
      </div>
      <div className="space-y-2">
        <Label>Interactive End Icon</Label>
        <Input
          endIcon={
            <button className="text-muted-foreground hover:text-foreground">
              <EyeOff />
            </button>
          }
          placeholder="Password with visibility toggle"
          startIcon={<Lock />}
          type="password"
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
        <p className="text-sm text-muted-foreground">
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
        <Input placeholder="john@example.com" startIcon={<Mail />} type="email" />
      </div>

      <div className="space-y-2">
        <Label>Phone</Label>
        <Input placeholder="+1 (555) 123-4567" startIcon={<Phone />} type="tel" />
      </div>

      <div className="space-y-2">
        <Label>Password</Label>
        <Input
          endIcon={
            <button className="text-muted-foreground hover:text-foreground">
              <Eye />
            </button>
          }
          placeholder="Enter password"
          startIcon={<Lock />}
          type="password"
        />
      </div>

      <div className="space-y-2">
        <Label>Credit Card</Label>
        <Input maxLength={19} placeholder="1234 5678 9012 3456" startIcon={<CreditCard />} />
      </div>

      <Button className="w-full">Submit</Button>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    disabled: false,
    placeholder: "Playground input",
    type: "text",
  },
};
