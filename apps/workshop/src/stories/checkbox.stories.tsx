import { Meta, StoryObj } from "@storybook/react";

import { Label,Checkbox, Button } from "@repo/ui";
import { useState } from "storybook/internal/preview-api";

const meta: Meta<typeof Checkbox> = {
  title: "ui/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    id: "default",
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox {...args} />
      <Label htmlFor="default">Default checkbox</Label>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="unchecked" />
        <Label htmlFor="unchecked">Unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="checked" checked />
        <Label htmlFor="checked">Checked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="indeterminate" checked="indeterminate" />
        <Label htmlFor="indeterminate">Indeterminate</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled" disabled />
        <Label htmlFor="disabled">Disabled</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled checked />
        <Label htmlFor="disabled-checked">Disabled & Checked</Label>
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms1" />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor="terms1">Accept terms and conditions</Label>
        <p className="text-sm text-muted-foreground">
          You agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="interactive"
            checked={checked}
            onCheckedChange={(checked) => {
              if (checked === "indeterminate") return;
              setChecked(checked);
            }}
          />
          <Label htmlFor="interactive">
            Interactive checkbox (currently {checked ? "checked" : "unchecked"})
          </Label>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setChecked(!checked)}
        >
          Toggle
        </Button>
      </div>
    );
  },
};

export const CheckboxGroup: Story = {
  render: () => {
    const [items, setItems] = useState([
      { id: "item1", label: "Item 1", checked: false },
      { id: "item2", label: "Item 2", checked: true },
      { id: "item3", label: "Item 3", checked: false },
      { id: "item4", label: "Item 4", checked: true },
    ]);

    const handleItemChange = (id: string, checked: boolean) => {
      setItems(
        items.map((item) => (item.id === id ? { ...item, checked } : item)),
      );
    };

    const allChecked = items.every((item) => item.checked);
    const someChecked = items.some((item) => item.checked);

    const handleSelectAll = (checked: boolean) => {
      setItems(items.map((item) => ({ ...item, checked })));
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={allChecked ? true : someChecked ? "indeterminate" : false}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="select-all" className="font-medium">
            Select All
          </Label>
        </div>
        <div className="border-t pt-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-2 ml-4">
              <Checkbox
                id={item.id}
                checked={item.checked}
                onCheckedChange={(checked) =>
                  handleItemChange(item.id, checked as boolean)
                }
              />
              <Label htmlFor={item.id}>{item.label}</Label>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Account Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Choose your notification preferences
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="email-notifications" />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="email-notifications">Email notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email about your account activity
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="marketing-emails" />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="marketing-emails">Marketing emails</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about new products and features
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="security-emails" checked />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="security-emails">Security emails</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about your account security
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="sms-notifications" disabled />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="sms-notifications">SMS notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive SMS about urgent account activity (coming soon)
            </p>
          </div>
        </div>
      </div>

      <Button className="w-full">Save Preferences</Button>
    </div>
  ),
};

export const TaskList: Story = {
  render: () => {
    const [tasks, setTasks] = useState([
      { id: 1, text: "Review project proposal", completed: true },
      { id: 2, text: "Update team on progress", completed: true },
      { id: 3, text: "Prepare presentation slides", completed: false },
      { id: 4, text: "Schedule client meeting", completed: false },
      { id: 5, text: "Submit final report", completed: false },
    ]);

    const toggleTask = (id: number) => {
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task,
        ),
      );
    };

    const completedCount = tasks.filter((task) => task.completed).length;

    return (
      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Today's Tasks</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {tasks.length} completed
          </p>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-2">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <Label
                htmlFor={`task-${task.id}`}
                className={`flex-1 ${
                  task.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.text}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="small" className="h-3 w-3" />
        <Label htmlFor="small" className="text-sm">
          Small checkbox
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="default-size" />
        <Label htmlFor="default-size">Default checkbox</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="large" className="h-5 w-5" />
        <Label htmlFor="large" className="text-lg">
          Large checkbox
        </Label>
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="custom1"
          className="border-green-500 data-[state=checked]:bg-green-500"
        />
        <Label htmlFor="custom1">Green checkbox</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="custom2"
          className="border-purple-500 data-[state=checked]:bg-purple-500 rounded-full"
        />
        <Label htmlFor="custom2">Purple rounded checkbox</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="custom3"
          className="border-orange-500 data-[state=checked]:bg-orange-500 h-5 w-5"
        />
        <Label htmlFor="custom3">Orange large checkbox</Label>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    id: "playground",
    checked: false,
    disabled: false,
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox {...args} />
      <Label htmlFor="playground">Playground checkbox</Label>
    </div>
  ),
};
