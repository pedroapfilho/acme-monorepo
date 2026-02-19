import { Progress } from "@repo/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, useEffect } from "react";

const meta: Meta<typeof Progress> = {
  argTypes: {
    value: {
      control: { max: 100, min: 0, step: 1, type: "range" },
    },
  },
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "ui/Progress",
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ProgressStates: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Starting</span>
          <span>0%</span>
        </div>
        <Progress value={0} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>In Progress</span>
          <span>33%</span>
        </div>
        <Progress value={33} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Half Way</span>
          <span>50%</span>
        </div>
        <Progress value={50} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Almost Done</span>
          <span>85%</span>
        </div>
        <Progress value={85} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Complete</span>
          <span>100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
};

const AnimatedProgressRender = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-80 space-y-2">
      <div className="flex justify-between text-sm">
        <span>Loading...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
};

export const AnimatedProgress: Story = {
  render: () => <AnimatedProgressRender />,
};

const LoadingSimulationRender = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // Reset to create a loop
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-80 space-y-2">
      <div className="flex justify-between text-sm">
        <span>Downloading...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
};

export const LoadingSimulation: Story = {
  render: () => <LoadingSimulationRender />,
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="space-y-2">
        <span className="text-sm">Small (h-1)</span>
        <Progress className="h-1" value={65} />
      </div>

      <div className="space-y-2">
        <span className="text-sm">Default (h-2)</span>
        <Progress value={65} />
      </div>

      <div className="space-y-2">
        <span className="text-sm">Medium (h-3)</span>
        <Progress className="h-3" value={65} />
      </div>

      <div className="space-y-2">
        <span className="text-sm">Large (h-4)</span>
        <Progress className="h-4" value={65} />
      </div>
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="upload-progress">
            Upload Progress
          </label>
          <span className="text-sm text-muted-foreground">45%</span>
        </div>
        <Progress id="upload-progress" value={45} />
        <p className="text-xs text-muted-foreground">Uploading file... 2.3 MB of 5.1 MB</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="installation-progress">
            Installation
          </label>
          <span className="text-sm text-muted-foreground">78%</span>
        </div>
        <Progress id="installation-progress" value={78} />
        <p className="text-xs text-muted-foreground">Installing dependencies...</p>
      </div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-80 rounded-lg border border-border bg-card p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Project Setup</h3>
          <p className="text-sm text-muted-foreground">Setting up your new project</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Creating directories</span>
              <span className="text-muted-foreground">✓</span>
            </div>
            <Progress value={100} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Installing packages</span>
              <span className="text-muted-foreground">65%</span>
            </div>
            <Progress value={65} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Configuring settings</span>
              <span className="text-muted-foreground">—</span>
            </div>
            <Progress value={0} />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    value: 60,
  },
  render: (args) => (
    <div className="w-80">
      <Progress {...args} />
    </div>
  ),
};
