import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Label,
  Button,
} from "@repo/ui";
import { Meta, StoryObj } from "@storybook/react-vite";
import { User, Calendar, Clock, Star, Flag, Users } from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof Select> = {
  title: "ui/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: { type: "boolean" },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select food category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="aubergine">Aubergine</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem value="carrot" disabled>
            Carrot (Out of stock)
          </SelectItem>
          <SelectItem value="courgette">Courgette</SelectItem>
          <SelectItem value="leek">Leek</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Meat</SelectLabel>
          <SelectItem value="beef">Beef</SelectItem>
          <SelectItem value="chicken">Chicken</SelectItem>
          <SelectItem value="lamb">Lamb</SelectItem>
          <SelectItem value="pork">Pork</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const States: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label>Normal Select</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Disabled Select</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="This is disabled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Select with Default Value</Label>
        <Select defaultValue="option2">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2 (Default)</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Small Select</Label>
        <Select>
          <SelectTrigger className="h-8 w-40 text-sm">
            <SelectValue placeholder="Small" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small1">Small Option 1</SelectItem>
            <SelectItem value="small2">Small Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Default Select</Label>
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Default size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default1">Default Option 1</SelectItem>
            <SelectItem value="default2">Default Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Large Select</Label>
        <Select>
          <SelectTrigger className="h-12 w-56 text-base">
            <SelectValue placeholder="Large size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="large1">Large Option 1</SelectItem>
            <SelectItem value="large2">Large Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label>User Role</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select user role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Administrator
              </div>
            </SelectItem>
            <SelectItem value="editor">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Editor
              </div>
            </SelectItem>
            <SelectItem value="viewer">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Viewer
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Priority Level</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-500" />
                High Priority
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-yellow-500" />
                Medium Priority
              </div>
            </SelectItem>
            <SelectItem value="low">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-green-500" />
                Low Priority
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const CountrySelect: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <Label>Country</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select your country" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>North America</SelectLabel>
            <SelectItem value="us">🇺🇸 United States</SelectItem>
            <SelectItem value="ca">🇨🇦 Canada</SelectItem>
            <SelectItem value="mx">🇲🇽 Mexico</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="gb">🇬🇧 United Kingdom</SelectItem>
            <SelectItem value="de">🇩🇪 Germany</SelectItem>
            <SelectItem value="fr">🇫🇷 France</SelectItem>
            <SelectItem value="es">🇪🇸 Spain</SelectItem>
            <SelectItem value="it">🇮🇹 Italy</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Asia</SelectLabel>
            <SelectItem value="jp">🇯🇵 Japan</SelectItem>
            <SelectItem value="kr">🇰🇷 South Korea</SelectItem>
            <SelectItem value="cn">🇨🇳 China</SelectItem>
            <SelectItem value="in">🇮🇳 India</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Project Settings</h3>
        <p className="text-muted-foreground text-sm">Configure your project preferences</p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Project Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">Web Application</SelectItem>
              <SelectItem value="mobile">Mobile App</SelectItem>
              <SelectItem value="desktop">Desktop Application</SelectItem>
              <SelectItem value="api">API Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Team Size</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solo">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Solo (1 person)
                </div>
              </SelectItem>
              <SelectItem value="small">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Small (2-5 people)
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Medium (6-15 people)
                </div>
              </SelectItem>
              <SelectItem value="large">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Large (16+ people)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Timeline</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Project timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />1 Week
                </div>
              </SelectItem>
              <SelectItem value="month">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />1 Month
                </div>
              </SelectItem>
              <SelectItem value="quarter">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />3 Months
                </div>
              </SelectItem>
              <SelectItem value="year">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />1 Year
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Set priority level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-red-500" />
                  Urgent
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-orange-500" />
                  High
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-500" />
                  Low
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button className="w-full">Create Project</Button>
    </div>
  ),
};

const ControlledSelectRender = () => {
  const [value, setValue] = useState("");

  return (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label>Controlled Select</Label>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
            <SelectItem value="option4">Option 4</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="text-muted-foreground text-sm">Selected value: {value || "None"}</div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setValue("option2")}>
          Set to Option 2
        </Button>
        <Button size="sm" variant="outline" onClick={() => setValue("")}>
          Clear
        </Button>
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledSelectRender />,
};

export const SearchableSelect: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <Label>Technology Stack</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select technologies" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Frontend</SelectLabel>
            <SelectItem value="react">React</SelectItem>
            <SelectItem value="vue">Vue.js</SelectItem>
            <SelectItem value="angular">Angular</SelectItem>
            <SelectItem value="svelte">Svelte</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Backend</SelectLabel>
            <SelectItem value="nodejs">Node.js</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Database</SelectLabel>
            <SelectItem value="postgresql">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
            <SelectItem value="mongodb">MongoDB</SelectItem>
            <SelectItem value="redis">Redis</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const MultipleSelects: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Delivery Information</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Country</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="de">Germany</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>State/Province</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ca">California</SelectItem>
              <SelectItem value="ny">New York</SelectItem>
              <SelectItem value="tx">Texas</SelectItem>
              <SelectItem value="fl">Florida</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Delivery Speed</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select delivery option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">
              <div className="flex w-full items-center justify-between">
                <span>Standard (5-7 days)</span>
                <span className="text-muted-foreground">Free</span>
              </div>
            </SelectItem>
            <SelectItem value="express">
              <div className="flex w-full items-center justify-between">
                <span>Express (2-3 days)</span>
                <span className="text-muted-foreground">$9.99</span>
              </div>
            </SelectItem>
            <SelectItem value="overnight">
              <div className="flex w-full items-center justify-between">
                <span>Overnight (1 day)</span>
                <span className="text-muted-foreground">$24.99</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    disabled: false,
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Playground select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="item1">Item 1</SelectItem>
        <SelectItem value="item2">Item 2</SelectItem>
        <SelectItem value="item3">Item 3</SelectItem>
        <SelectItem value="item4" disabled>
          Item 4 (Disabled)
        </SelectItem>
      </SelectContent>
    </Select>
  ),
};
