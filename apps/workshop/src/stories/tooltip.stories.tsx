import { Button, Input, Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui";
import { Meta, StoryObj } from "@storybook/react-vite";
import {
  Plus,
  Edit,
  Trash2,
  Share,
  Download,
  Copy,
  Heart,
  Star,
  Info,
  HelpCircle,
  Settings,
  User,
  Bell,
  Search,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof Tooltip> = {
  title: "ui/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" className="w-10 rounded-full p-0">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const BasicTooltips: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <Share className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete permanently</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 p-8">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Top Left</Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="start">
          <p>Tooltip on top left</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Top Right</Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="end">
          <p>Tooltip on top right</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>

      <div />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Bottom Left</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          <p>Tooltip on bottom left</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Bottom Right</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          <p>Tooltip on bottom right</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const RichContent: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">User Info</Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">John Doe</span>
            </div>
            <p className="text-sm">Senior Developer</p>
            <p className="text-muted-foreground text-xs">Last active 2 hours ago</p>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Status</Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>All systems operational</span>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Warning</Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>Limited functionality</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const InteractiveElements: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Input placeholder="Hover for help" className="w-40" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Enter your email address</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help underline decoration-dotted">What is this?</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>
            This is a helpful tooltip that explains what this feature does and how to use it
            effectively.
          </p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex cursor-help items-center gap-1">
            <span>Advanced Settings</span>
            <HelpCircle className="text-muted-foreground h-3 w-3" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Configure advanced options for power users</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

const ActionTooltipsRender = () => {
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);

  return (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setLiked(!liked)}>
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{liked ? "Remove from favorites" : "Add to favorites"}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setStarred(!starred)}>
            <Star className={`h-4 w-4 ${starred ? "fill-yellow-500 text-yellow-500" : ""}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{starred ? "Unstar" : "Star this item"}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export const ActionTooltips: Story = {
  render: () => <ActionTooltipsRender />,
};

export const DelayedTooltip: Story = {
  render: () => (
    <div className="space-y-4">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button variant="outline">Instant (0ms)</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Shows immediately</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button variant="outline">Normal (500ms)</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Shows after 500ms</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button variant="outline">Delayed (1000ms)</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Shows after 1 second</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const NavigationTooltips: Story = {
  render: () => (
    <div className="bg-muted flex gap-2 rounded-lg p-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="flex items-center gap-2">
            <span>Search</span>
            <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
              ⌘K
            </kbd>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Profile</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const FormTooltips: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="form-tooltip-password" className="text-sm font-medium">Password</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground h-3 w-3 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Password must be at least 8 characters long and contain at least one number and one
                special character.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input id="form-tooltip-password" type="password" placeholder="Enter password" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="form-tooltip-api-key" className="text-sm font-medium">API Key</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="text-muted-foreground h-3 w-3 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>You can find your API key in the dashboard settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input id="form-tooltip-api-key" placeholder="Enter API key" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="form-tooltip-webhook" className="text-sm font-medium">Webhook URL</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground h-3 w-3 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium">Webhook Requirements:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Must be HTTPS</li>
                  <li>• Should respond with 200 status</li>
                  <li>• Timeout after 30 seconds</li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input id="form-tooltip-webhook" placeholder="https://example.com/webhook" />
      </div>
    </div>
  ),
};

export const StatusTooltips: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm">Server Status:</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex cursor-help items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-green-600">Online</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Server Health</p>
              <p className="text-xs">CPU: 45% | Memory: 62%</p>
              <p className="text-xs">Uptime: 15 days, 4 hours</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Database:</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex cursor-help items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-sm text-yellow-600">Warning</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Database Status</p>
              <p className="text-xs">Connection pool at 85%</p>
              <p className="text-xs">Consider scaling up</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">API:</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex cursor-help items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-sm text-red-600">Error</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">API Gateway Down</p>
              <p className="text-xs">Last error: Connection timeout</p>
              <p className="text-xs">Auto-retry in 2 minutes</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Playground Tooltip</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a playground tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};
