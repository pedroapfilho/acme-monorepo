import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  parameters: {
    layout: "padded",
  },
  title: "Design System/Colors",
};

export default meta;
type Story = StoryObj;

type ColorSwatchProps = {
  description?: string;
  name: string;
  variable: string;
};

const ColorSwatch = ({ description, name, variable }: ColorSwatchProps) => (
  <div className="flex items-center gap-4 rounded-lg border border-border p-4">
    <div
      className="h-16 w-16 rounded-lg border border-border shadow-sm"
      style={{ backgroundColor: `var(${variable})` }}
    />
    <div className="flex-1">
      <h3 className="font-medium text-foreground">{name}</h3>
      <code className="font-mono text-sm text-muted-foreground">{variable}</code>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  </div>
);

type ColorSectionProps = {
  colors: Array<{
    description?: string;
    name: string;
    variable: string;
  }>;
  title: string;
};

const ColorSection = ({ colors, title }: ColorSectionProps) => (
  <div className="space-y-4">
    <h2 className="border-b border-border pb-2 text-xl font-semibold text-foreground">{title}</h2>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {colors.map((color) => (
        <ColorSwatch
          description={color.description}
          key={color.variable}
          name={color.name}
          variable={color.variable}
        />
      ))}
    </div>
  </div>
);

export const AllColors: Story = {
  render: () => (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">Color System</h1>
        <p className="text-muted-foreground">
          Complete overview of all colors in the design system with their CSS variables
        </p>
      </div>

      <ColorSection
        colors={[
          {
            description: "Primary background color for the application",
            name: "Background",
            variable: "--background",
          },
          {
            description: "Primary text color",
            name: "Foreground",
            variable: "--foreground",
          },
          {
            description: "Default border color",
            name: "Border",
            variable: "--border",
          },
          {
            description: "Input field background color",
            name: "Input",
            variable: "--input",
          },
          {
            description: "Focus ring color",
            name: "Ring",
            variable: "--ring",
          },
        ]}
        title="Base Colors"
      />

      <ColorSection
        colors={[
          {
            description: "Card background color",
            name: "Card",
            variable: "--card",
          },
          {
            description: "Text color on cards",
            name: "Card Foreground",
            variable: "--card-foreground",
          },
        ]}
        title="Card Colors"
      />

      <ColorSection
        colors={[
          {
            description: "Popover background color",
            name: "Popover",
            variable: "--popover",
          },
          {
            description: "Text color in popovers",
            name: "Popover Foreground",
            variable: "--popover-foreground",
          },
        ]}
        title="Popover Colors"
      />

      <ColorSection
        colors={[
          {
            description: "Primary brand color",
            name: "Primary",
            variable: "--primary",
          },
          {
            description: "Text color on primary backgrounds",
            name: "Primary Foreground",
            variable: "--primary-foreground",
          },
        ]}
        title="Primary Colors"
      />

      <ColorSection
        colors={[
          {
            description: "Secondary background color",
            name: "Secondary",
            variable: "--secondary",
          },
          {
            description: "Text color on secondary backgrounds",
            name: "Secondary Foreground",
            variable: "--secondary-foreground",
          },
        ]}
        title="Secondary Colors"
      />

      <ColorSection
        colors={[
          {
            description: "Muted background color",
            name: "Muted",
            variable: "--muted",
          },
          {
            description: "Muted text color",
            name: "Muted Foreground",
            variable: "--muted-foreground",
          },
        ]}
        title="Muted Colors"
      />

      <ColorSection
        colors={[
          {
            description: "Accent background color",
            name: "Accent",
            variable: "--accent",
          },
          {
            description: "Text color on accent backgrounds",
            name: "Accent Foreground",
            variable: "--accent-foreground",
          },
        ]}
        title="Accent Colors"
      />

      <ColorSection
        colors={[
          {
            description: "Error and destructive action color",
            name: "Destructive",
            variable: "--destructive",
          },
          {
            description: "Text color on destructive backgrounds",
            name: "Destructive Foreground",
            variable: "--destructive-foreground",
          },
        ]}
        title="Destructive Colors"
      />

      <ColorSection
        colors={[
          {
            description: "Primary chart color",
            name: "Chart 1",
            variable: "--chart-1",
          },
          {
            description: "Secondary chart color",
            name: "Chart 2",
            variable: "--chart-2",
          },
          {
            description: "Tertiary chart color",
            name: "Chart 3",
            variable: "--chart-3",
          },
          {
            description: "Quaternary chart color",
            name: "Chart 4",
            variable: "--chart-4",
          },
          {
            description: "Quinary chart color",
            name: "Chart 5",
            variable: "--chart-5",
          },
        ]}
        title="Chart Colors"
      />

      <ColorSection
        colors={[
          {
            description: "Sidebar background color",
            name: "Sidebar",
            variable: "--sidebar",
          },
          {
            description: "Sidebar text color",
            name: "Sidebar Foreground",
            variable: "--sidebar-foreground",
          },
          {
            description: "Sidebar primary color",
            name: "Sidebar Primary",
            variable: "--sidebar-primary",
          },
          {
            description: "Text color on sidebar primary backgrounds",
            name: "Sidebar Primary Foreground",
            variable: "--sidebar-primary-foreground",
          },
          {
            description: "Sidebar accent color",
            name: "Sidebar Accent",
            variable: "--sidebar-accent",
          },
          {
            description: "Text color on sidebar accent backgrounds",
            name: "Sidebar Accent Foreground",
            variable: "--sidebar-accent-foreground",
          },
          {
            description: "Sidebar border color",
            name: "Sidebar Border",
            variable: "--sidebar-border",
          },
          {
            description: "Sidebar focus ring color",
            name: "Sidebar Ring",
            variable: "--sidebar-ring",
          },
        ]}
        title="Sidebar Colors"
      />
    </div>
  ),
};
