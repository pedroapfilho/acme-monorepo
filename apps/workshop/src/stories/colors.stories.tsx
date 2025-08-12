import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Design System/Colors",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

interface ColorSwatchProps {
  name: string;
  variable: string;
  description?: string;
}

const ColorSwatch = ({ name, variable, description }: ColorSwatchProps) => (
  <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
    <div
      className="w-16 h-16 rounded-lg border border-border shadow-sm"
      style={{ backgroundColor: `var(${variable})` }}
    />
    <div className="flex-1">
      <h3 className="font-medium text-foreground">{name}</h3>
      <code className="text-sm text-muted-foreground font-mono">
        {variable}
      </code>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  </div>
);

interface ColorSectionProps {
  title: string;
  colors: Array<{
    name: string;
    variable: string;
    description?: string;
  }>;
}

const ColorSection = ({ title, colors }: ColorSectionProps) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
      {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {colors.map((color) => (
        <ColorSwatch
          key={color.variable}
          name={color.name}
          variable={color.variable}
          description={color.description}
        />
      ))}
    </div>
  </div>
);

export const AllColors: Story = {
  render: () => (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Color System</h1>
        <p className="text-muted-foreground">
          Complete overview of all colors in the design system with their CSS
          variables
        </p>
      </div>

      <ColorSection
        title="Base Colors"
        colors={[
          {
            name: "Background",
            variable: "--background",
            description: "Primary background color for the application",
          },
          {
            name: "Foreground",
            variable: "--foreground",
            description: "Primary text color",
          },
          {
            name: "Border",
            variable: "--border",
            description: "Default border color",
          },
          {
            name: "Input",
            variable: "--input",
            description: "Input field background color",
          },
          {
            name: "Ring",
            variable: "--ring",
            description: "Focus ring color",
          },
        ]}
      />

      <ColorSection
        title="Card Colors"
        colors={[
          {
            name: "Card",
            variable: "--card",
            description: "Card background color",
          },
          {
            name: "Card Foreground",
            variable: "--card-foreground",
            description: "Text color on cards",
          },
        ]}
      />

      <ColorSection
        title="Popover Colors"
        colors={[
          {
            name: "Popover",
            variable: "--popover",
            description: "Popover background color",
          },
          {
            name: "Popover Foreground",
            variable: "--popover-foreground",
            description: "Text color in popovers",
          },
        ]}
      />

      <ColorSection
        title="Primary Colors"
        colors={[
          {
            name: "Primary",
            variable: "--primary",
            description: "Primary brand color",
          },
          {
            name: "Primary Foreground",
            variable: "--primary-foreground",
            description: "Text color on primary backgrounds",
          },
        ]}
      />

      <ColorSection
        title="Secondary Colors"
        colors={[
          {
            name: "Secondary",
            variable: "--secondary",
            description: "Secondary background color",
          },
          {
            name: "Secondary Foreground",
            variable: "--secondary-foreground",
            description: "Text color on secondary backgrounds",
          },
        ]}
      />

      <ColorSection
        title="Muted Colors"
        colors={[
          {
            name: "Muted",
            variable: "--muted",
            description: "Muted background color",
          },
          {
            name: "Muted Foreground",
            variable: "--muted-foreground",
            description: "Muted text color",
          },
        ]}
      />

      <ColorSection
        title="Accent Colors"
        colors={[
          {
            name: "Accent",
            variable: "--accent",
            description: "Accent background color",
          },
          {
            name: "Accent Foreground",
            variable: "--accent-foreground",
            description: "Text color on accent backgrounds",
          },
        ]}
      />

      <ColorSection
        title="Destructive Colors"
        colors={[
          {
            name: "Destructive",
            variable: "--destructive",
            description: "Error and destructive action color",
          },
          {
            name: "Destructive Foreground",
            variable: "--destructive-foreground",
            description: "Text color on destructive backgrounds",
          },
        ]}
      />

      <ColorSection
        title="Chart Colors"
        colors={[
          {
            name: "Chart 1",
            variable: "--chart-1",
            description: "Primary chart color",
          },
          {
            name: "Chart 2",
            variable: "--chart-2",
            description: "Secondary chart color",
          },
          {
            name: "Chart 3",
            variable: "--chart-3",
            description: "Tertiary chart color",
          },
          {
            name: "Chart 4",
            variable: "--chart-4",
            description: "Quaternary chart color",
          },
          {
            name: "Chart 5",
            variable: "--chart-5",
            description: "Quinary chart color",
          },
        ]}
      />

      <ColorSection
        title="Sidebar Colors"
        colors={[
          {
            name: "Sidebar",
            variable: "--sidebar",
            description: "Sidebar background color",
          },
          {
            name: "Sidebar Foreground",
            variable: "--sidebar-foreground",
            description: "Sidebar text color",
          },
          {
            name: "Sidebar Primary",
            variable: "--sidebar-primary",
            description: "Sidebar primary color",
          },
          {
            name: "Sidebar Primary Foreground",
            variable: "--sidebar-primary-foreground",
            description: "Text color on sidebar primary backgrounds",
          },
          {
            name: "Sidebar Accent",
            variable: "--sidebar-accent",
            description: "Sidebar accent color",
          },
          {
            name: "Sidebar Accent Foreground",
            variable: "--sidebar-accent-foreground",
            description: "Text color on sidebar accent backgrounds",
          },
          {
            name: "Sidebar Border",
            variable: "--sidebar-border",
            description: "Sidebar border color",
          },
          {
            name: "Sidebar Ring",
            variable: "--sidebar-ring",
            description: "Sidebar focus ring color",
          },
        ]}
      />
    </div>
  ),
};
