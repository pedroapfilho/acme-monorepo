import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "Design System/Colors",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

type ColorSwatchProps = {
  name: string;
  variable: string;
  description?: string;
};

const ColorSwatch = ({ name, variable, description }: ColorSwatchProps) => (
  <div className="border-border flex items-center gap-4 rounded-lg border p-4">
    <div
      className="border-border h-16 w-16 rounded-lg border shadow-sm"
      style={{ backgroundColor: `var(${variable})` }}
    />
    <div className="flex-1">
      <h3 className="text-foreground font-medium">{name}</h3>
      <code className="text-muted-foreground font-mono text-sm">{variable}</code>
      {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
    </div>
  </div>
);

type ColorSectionProps = {
  title: string;
  colors: Array<{
    name: string;
    variable: string;
    description?: string;
  }>;
};

const ColorSection = ({ title, colors }: ColorSectionProps) => (
  <div className="space-y-4">
    <h2 className="text-foreground border-border border-b pb-2 text-xl font-semibold">{title}</h2>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-foreground text-3xl font-bold">Color System</h1>
        <p className="text-muted-foreground">
          Complete overview of all colors in the design system with their CSS variables
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
