import { Label, Switch, Button } from "@repo/ui";
import { Meta, StoryObj } from "@storybook/react-vite";
import { Wifi, Bluetooth, Bell, BellOff, Moon, Shield } from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof Switch> = {
  argTypes: {
    checked: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "ui/Switch",
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
        <Switch checked id="checked" />
        <Label htmlFor="checked">Checked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch disabled id="disabled" />
        <Label htmlFor="disabled">Disabled (unchecked)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch checked disabled id="disabled-checked" />
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
        <Label className="flex items-center gap-2" htmlFor="wifi">
          <Wifi className="h-4 w-4" />
          WiFi
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="bluetooth" />
        <Label className="flex items-center gap-2" htmlFor="bluetooth">
          <Bluetooth className="h-4 w-4" />
          Bluetooth
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="notifications" />
        <Label className="flex items-center gap-2" htmlFor="notifications">
          <Bell className="h-4 w-4" />
          Notifications
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="dark-mode" />
        <Label className="flex items-center gap-2" htmlFor="dark-mode">
          <Moon className="h-4 w-4" />
          Dark Mode
        </Label>
      </div>
    </div>
  ),
};

const InteractiveRender = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch checked={isEnabled} id="interactive" onCheckedChange={setIsEnabled} />
        <Label htmlFor="interactive">Feature is {isEnabled ? "enabled" : "disabled"}</Label>
      </div>
      <Button onClick={() => setIsEnabled(!isEnabled)} size="sm" variant="outline">
        Toggle Programmatically
      </Button>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveRender />,
};

const SettingsPanelRender = () => {
  const [settings, setSettings] = useState({
    analytics: false,
    autoSave: true,
    darkMode: false,
    emailAlerts: false,
    notifications: true,
    sounds: true,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-md space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Account Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences and notifications
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Notifications</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-normal" htmlFor="push-notifications">
                  Push notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive push notifications on your devices
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                id="push-notifications"
                onCheckedChange={(checked) => updateSetting("notifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-normal" htmlFor="email-alerts">
                  Email alerts
                </Label>
                <p className="text-xs text-muted-foreground">Receive important updates via email</p>
              </div>
              <Switch
                checked={settings.emailAlerts}
                id="email-alerts"
                onCheckedChange={(checked) => updateSetting("emailAlerts", checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Preferences</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-normal" htmlFor="auto-save">
                  Auto-save
                </Label>
                <p className="text-xs text-muted-foreground">Automatically save your work</p>
              </div>
              <Switch
                checked={settings.autoSave}
                id="auto-save"
                onCheckedChange={(checked) => updateSetting("autoSave", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-normal" htmlFor="dark-theme">
                  Dark theme
                </Label>
                <p className="text-xs text-muted-foreground">Use dark mode interface</p>
              </div>
              <Switch
                checked={settings.darkMode}
                id="dark-theme"
                onCheckedChange={(checked) => updateSetting("darkMode", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-normal" htmlFor="sound-effects">
                  Sound effects
                </Label>
                <p className="text-xs text-muted-foreground">Play sounds for interactions</p>
              </div>
              <Switch
                checked={settings.sounds}
                id="sound-effects"
                onCheckedChange={(checked) => updateSetting("sounds", checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Privacy</h4>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-normal" htmlFor="analytics">
                Analytics
              </Label>
              <p className="text-xs text-muted-foreground">
                Help improve our service with usage data
              </p>
            </div>
            <Switch
              checked={settings.analytics}
              id="analytics"
              onCheckedChange={(checked) => updateSetting("analytics", checked)}
            />
          </div>
        </div>
      </div>

      <Button className="w-full">Save Settings</Button>
    </div>
  );
};

export const SettingsPanel: Story = {
  render: () => <SettingsPanelRender />,
};

const SystemControlsRender = () => {
  const [controls, setControls] = useState({
    airplaneMode: false,
    bluetooth: false,
    doNotDisturb: false,
    location: true,
    wifi: true,
  });

  const updateControl = (key: string, value: boolean) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-sm space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">System Controls</h3>
        <p className="text-sm text-muted-foreground">Quick access to system settings</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <Wifi
              className={`h-5 w-5 ${controls.wifi ? "text-blue-500" : "text-muted-foreground"}`}
            />
            <Switch
              checked={controls.wifi}
              onCheckedChange={(checked) => updateControl("wifi", checked)}
            />
          </div>
          <div>
            <p className="text-sm font-medium">WiFi</p>
            <p className="text-xs text-muted-foreground">
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
              onCheckedChange={(checked) => updateControl("bluetooth", checked)}
            />
          </div>
          <div>
            <p className="text-sm font-medium">Bluetooth</p>
            <p className="text-xs text-muted-foreground">{controls.bluetooth ? "On" : "Off"}</p>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            {controls.doNotDisturb ? (
              <BellOff className="h-5 w-5 text-orange-500" />
            ) : (
              <Bell className="h-5 w-5 text-muted-foreground" />
            )}
            <Switch
              checked={controls.doNotDisturb}
              onCheckedChange={(checked) => updateControl("doNotDisturb", checked)}
            />
          </div>
          <div>
            <p className="text-sm font-medium">Do Not Disturb</p>
            <p className="text-xs text-muted-foreground">
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
              onCheckedChange={(checked) => updateControl("location", checked)}
            />
          </div>
          <div>
            <p className="text-sm font-medium">Location</p>
            <p className="text-xs text-muted-foreground">
              {controls.location ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SystemControls: Story = {
  render: () => <SystemControlsRender />,
};

export const FormIntegration: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Project Preferences</h3>
        <p className="text-sm text-muted-foreground">Configure your project settings</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm" htmlFor="public-project">
              Make project public
            </Label>
            <p className="text-xs text-muted-foreground">Allow others to view this project</p>
          </div>
          <Switch id="public-project" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm" htmlFor="allow-comments">
              Allow comments
            </Label>
            <p className="text-xs text-muted-foreground">Let viewers leave feedback</p>
          </div>
          <Switch id="allow-comments" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm" htmlFor="email-updates">
              Email updates
            </Label>
            <p className="text-xs text-muted-foreground">
              Receive notifications about project activity
            </p>
          </div>
          <Switch defaultChecked id="email-updates" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm" htmlFor="auto-backup">
              Automatic backups
            </Label>
            <p className="text-xs text-muted-foreground">Backup project data daily</p>
          </div>
          <Switch defaultChecked id="auto-backup" />
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
        <Switch className="scale-75" id="small" />
        <Label className="text-sm" htmlFor="small">
          Small switch
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="default-size" />
        <Label htmlFor="default-size">Default switch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch className="scale-125" id="large" />
        <Label className="text-lg" htmlFor="large">
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
        <Switch className="data-[state=checked]:bg-green-500" id="custom1" />
        <Label htmlFor="custom1">Green switch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch className="data-[state=checked]:bg-purple-500" id="custom2" />
        <Label htmlFor="custom2">Purple switch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch className="data-[state=checked]:bg-orange-500" id="custom3" />
        <Label htmlFor="custom3">Orange switch</Label>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    checked: false,
    disabled: false,
    id: "playground",
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch {...args} />
      <Label htmlFor="playground">Playground switch</Label>
    </div>
  ),
};
