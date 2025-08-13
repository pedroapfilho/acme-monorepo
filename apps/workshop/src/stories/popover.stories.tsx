import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Settings2,
  HelpCircle,
  Info,
  User,
  Calendar,
  Clock,
  Share,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Copy,
  ExternalLink,
  Plus,
  Filter,
  Search,
  Bell,
} from "lucide-react";

import {
  Button,
  Input,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Label
} from "@repo/ui";


const meta: Meta<typeof Popover> = {
  title: "ui/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-10 rounded-full p-0">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Open popover</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const HelpPopover: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <h4 className="font-medium">Help & Support</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Need help with this feature? Here are some quick tips:
          </p>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Use keyboard shortcuts for faster navigation</li>
            <li>• Click and drag to reorder items</li>
            <li>• Right-click for additional options</li>
          </ul>
          <div className="pt-2">
            <Button size="sm" className="w-full">
              View Documentation
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const UserProfilePopover: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
              JD
            </div>
            <div>
              <h4 className="font-medium">John Doe</h4>
              <p className="text-sm text-muted-foreground">john@example.com</p>
            </div>
          </div>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings2 className="mr-2 h-4 w-4" />
              Preferences
            </Button>
          </div>
          <div className="border-t pt-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const ActionsMenu: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in new tab
          </Button>
          <div className="border-t my-1" />
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const DateTimePicker: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Select Date & Time
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Schedule Meeting</h4>
            <p className="text-sm text-muted-foreground">
              Choose a date and time for your meeting.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input id="start-time" type="time" defaultValue="10:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input id="end-time" type="time" defaultValue="11:00" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="all-day" />
              <Label htmlFor="all-day" className="text-sm">
                All day event
              </Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm">Schedule</Button>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const FilterPopover: Story = {
  render: () => {
    const [filters, setFilters] = useState({
      status: [],
      priority: [],
      assignee: [],
    });

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Filter Tasks</h4>
              <p className="text-sm text-muted-foreground">
                Narrow down your task list.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="todo" />
                    <Label htmlFor="todo" className="text-sm">
                      To Do
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="in-progress" />
                    <Label htmlFor="in-progress" className="text-sm">
                      In Progress
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="done" />
                    <Label htmlFor="done" className="text-sm">
                      Done
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Priority</Label>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="high" />
                    <Label htmlFor="high" className="text-sm">
                      High
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="medium" />
                    <Label htmlFor="medium" className="text-sm">
                      Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="low" />
                    <Label htmlFor="low" className="text-sm">
                      Low
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm">Apply Filters</Button>
              <Button variant="outline" size="sm">
                Clear All
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};

export const SearchPopover: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Quick Search</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search anything..." className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Recent Searches</Label>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-8"
              >
                <Clock className="mr-2 h-3 w-3" />
                user interface design
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-8"
              >
                <Clock className="mr-2 h-3 w-3" />
                project management
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-8"
              >
                <Clock className="mr-2 h-3 w-3" />
                team collaboration
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Actions</Label>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-8"
              >
                <Plus className="mr-2 h-3 w-3" />
                Create new project
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-8"
              >
                <User className="mr-2 h-3 w-3" />
                Add team member
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const NotificationPopover: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full flex items-center justify-center">
            <span className="text-xs text-white">3</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Notifications</h4>
            <Button variant="ghost" size="sm">
              Mark all read
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">New message received</p>
                <p className="text-xs text-muted-foreground">
                  John sent you a message about the project update
                </p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>

            <div className="flex gap-3 p-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Task completed</p>
                <p className="text-xs text-muted-foreground">
                  "Design system update" has been marked as complete
                </p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>

            <div className="flex gap-3 p-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Meeting reminder</p>
                <p className="text-xs text-muted-foreground">
                  Team standup in 30 minutes
                </p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-2">
            <Button variant="ghost" className="w-full text-sm">
              View all notifications
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)}>Open Popover</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close Popover
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Popover is currently {open ? "open" : "closed"}
        </p>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">Controlled Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <h4 className="font-medium">Controlled Popover</h4>
              <p className="text-sm text-muted-foreground">
                This popover's open state is controlled by the parent component.
              </p>
              <Button size="sm" onClick={() => setOpen(false)}>
                Close from inside
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
};

export const Playground: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Playground Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <h4 className="font-medium">Playground</h4>
          <p className="text-sm text-muted-foreground">
            This is a playground popover for testing purposes.
          </p>
          <Button size="sm">Action Button</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
