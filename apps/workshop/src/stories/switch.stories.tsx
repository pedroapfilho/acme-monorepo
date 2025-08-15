import { Label, Switch, Button } from "@repo/ui";
import { Meta, StoryObj } from "@storybook/react-vite";
import { Wifi, Bluetooth, Bell, BellOff, Moon, Shield } from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof Switch> = {
  title: "ui/Switch",
  component: Switch,
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

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    id: "default",
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch {...args} />
      <Label htmlFor="default">Default switch</Label>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="unchecked" />
        <Label htmlFor="unchecked">Unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="checked" checked />
        <Label htmlFor="checked">Checked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled" disabled />
        <Label htmlFor="disabled">Disabled (unchecked)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled-checked" disabled checked />
        <Label htmlFor="disabled-checked">Disabled (checked)</Label>
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="wifi" />
        <Label htmlFor="wifi" className="flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          WiFi
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="bluetooth" />
        <Label htmlFor="bluetooth" className="flex items-center gap-2">
          <Bluetooth className="h-4 w-4" />
          Bluetooth
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="notifications" />
        <Label htmlFor="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="dark-mode" />
        <Label htmlFor="dark-mode" className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          Dark Mode
        </Label>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [isEnabled, setIsEnabled] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="interactive"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
          <Label htmlFor="interactive">
            Feature is {isEnabled ? "enabled" : "disabled"}
          </Label>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEnabled(!isEnabled)}
        >
          Toggle Programmatically
        </Button>
      </div>
    );
  },
};

export const SettingsPanel: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      notifications: true,
      emailAlerts: false,
      autoSave: true,
      darkMode: false,
      sounds: true,
      analytics: false,
    });

    const updateSetting = (key: string, value: boolean) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    };

    return (
      <div className="max-w-md space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Account Settings</h3>
          <p className="text-muted-foreground text-sm">
            Manage your account preferences and notifications
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="push-notifications"
                    className="text-sm font-normal"
                  >
                    Push notifications
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Receive push notifications on your devices
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) =>
                    updateSetting("notifications", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-alerts" className="text-sm font-normal">
                    Email alerts
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  id="email-alerts"
                  checked={settings.emailAlerts}
                  onCheckedChange={(checked) =>
                    updateSetting("emailAlerts", checked)
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Preferences</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save" className="text-sm font-normal">
                    Auto-save
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Automatically save your work
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) =>
                    updateSetting("autoSave", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-theme" className="text-sm font-normal">
                    Dark theme
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Use dark mode interface
                  </p>
                </div>
                <Switch
                  id="dark-theme"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) =>
                    updateSetting("darkMode", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="sound-effects"
                    className="text-sm font-normal"
                  >
                    Sound effects
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Play sounds for interactions
                  </p>
                </div>
                <Switch
                  id="sound-effects"
                  checked={settings.sounds}
                  onCheckedChange={(checked) =>
                    updateSetting("sounds", checked)
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Privacy</h4>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics" className="text-sm font-normal">
                  Analytics
                </Label>
                <p className="text-muted-foreground text-xs">
                  Help improve our service with usage data
                </p>
              </div>
              <Switch
                id="analytics"
                checked={settings.analytics}
                onCheckedChange={(checked) =>
                  updateSetting("analytics", checked)
                }
              />
            </div>
          </div>
        </div>

        <Button className="w-full">Save Settings</Button>
      </div>
    );
  },
};

export const SystemControls: Story = {
  render: () => {
    const [controls, setControls] = useState({
      wifi: true,
      bluetooth: false,
      location: true,
      airplaneMode: false,
      doNotDisturb: false,
    });

    const updateControl = (key: string, value: boolean) => {
      setControls((prev) => ({ ...prev, [key]: value }));
    };

    return (
      <div className="max-w-sm space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">System Controls</h3>
          <p className="text-muted-foreground text-sm">
            Quick access to system settings
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Wifi
                className={`h-5 w-5 ${
                  controls.wifi ? "text-blue-500" : "text-muted-foreground"
                }`}
              />
              <Switch
                checked={controls.wifi}
                onCheckedChange={(checked) => updateControl("wifi", checked)}
              />
            </div>
            <div>
              <p className="text-sm font-medium">WiFi</p>
              <p className="text-muted-foreground text-xs">
                {controls.wifi ? "Connected" : "Disconnected"}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Bluetooth
                className={`h-5 w-5 ${
                  controls.bluetooth ? "text-blue-500" : "text-muted-foreground"
                }`}
              />
              <Switch
                checked={controls.bluetooth}
                onCheckedChange={(checked) =>
                  updateControl("bluetooth", checked)
                }
              />
            </div>
            <div>
              <p className="text-sm font-medium">Bluetooth</p>
              <p className="text-muted-foreground text-xs">
                {controls.bluetooth ? "On" : "Off"}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              {controls.doNotDisturb ? (
                <BellOff className="h-5 w-5 text-orange-500" />
              ) : (
                <Bell className="text-muted-foreground h-5 w-5" />
              )}
              <Switch
                checked={controls.doNotDisturb}
                onCheckedChange={(checked) =>
                  updateControl("doNotDisturb", checked)
                }
              />
            </div>
            <div>
              <p className="text-sm font-medium">Do Not Disturb</p>
              <p className="text-muted-foreground text-xs">
                {controls.doNotDisturb ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Shield
                className={`h-5 w-5 ${
                  controls.location ? "text-green-500" : "text-muted-foreground"
                }`}
              />
              <Switch
                checked={controls.location}
                onCheckedChange={(checked) =>
                  updateControl("location", checked)
                }
              />
            </div>
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-muted-foreground text-xs">
                {controls.location ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const FormIntegration: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Project Preferences</h3>
        <p className="text-muted-foreground text-sm">
          Configure your project settings
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="public-project" className="text-sm">
              Make project public
            </Label>
            <p className="text-muted-foreground text-xs">
              Allow others to view this project
            </p>
          </div>
          <Switch id="public-project" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allow-comments" className="text-sm">
              Allow comments
            </Label>
            <p className="text-muted-foreground text-xs">
              Let viewers leave feedback
            </p>
          </div>
          <Switch id="allow-comments" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-updates" className="text-sm">
              Email updates
            </Label>
            <p className="text-muted-foreground text-xs">
              Receive notifications about project activity
            </p>
          </div>
          <Switch id="email-updates" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-backup" className="text-sm">
              Automatic backups
            </Label>
            <p className="text-muted-foreground text-xs">
              Backup project data daily
            </p>
          </div>
          <Switch id="auto-backup" defaultChecked />
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1">Save Changes</Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="small" className="scale-75" />
        <Label htmlFor="small" className="text-sm">
          Small switch
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="default-size" />
        <Label htmlFor="default-size">Default switch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="large" className="scale-125" />
        <Label htmlFor="large" className="text-lg">
          Large switch
        </Label>
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="custom1" className="data-[state=checked]:bg-green-500" />
        <Label htmlFor="custom1">Green switch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="custom2" className="data-[state=checked]:bg-purple-500" />
        <Label htmlFor="custom2">Purple switch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="custom3" className="data-[state=checked]:bg-orange-500" />
        <Label htmlFor="custom3">Orange switch</Label>
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
      <Switch {...args} />
      <Label htmlFor="playground">Playground switch</Label>
    </div>
  ),
};
