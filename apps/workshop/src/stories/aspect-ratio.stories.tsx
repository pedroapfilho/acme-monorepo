import { AspectRatio } from "@repo/ui";
import { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof AspectRatio> = {
  argTypes: {},
  component: AspectRatio,
  tags: ["autodocs"],
  title: "ui/AspectRatio",
};

export default meta;

type Story = StoryObj<typeof AspectRatio>;

export const Base: Story = {
  args: {},
  render: () => (
    <AspectRatio className="bg-slate-50 dark:bg-slate-800" ratio={16 / 9}>
      <img
        alt="Photo by Alvaro Pinot"
        className="rounded-md object-cover"
        src="https://images.unsplash.com/photo-1576075796033-848c2a5f3696?w=800&dpr=2&q=80"
      />
    </AspectRatio>
  ),
};
