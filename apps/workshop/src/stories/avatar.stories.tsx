import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui";
import { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Avatar> = {
  title: "ui/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/thenamespace.png" />
      <AvatarFallback>TNS</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src="https://github.com/thenamespace.png" />
        <AvatarFallback className="text-xs">SM</AvatarFallback>
      </Avatar>
      <Avatar className="h-10 w-10">
        <AvatarImage src="https://github.com/thenamespace.png" />
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="h-12 w-12">
        <AvatarImage src="https://github.com/thenamespace.png" />
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      <Avatar className="h-16 w-16">
        <AvatarImage src="https://github.com/thenamespace.png" />
        <AvatarFallback className="text-lg">XL</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage
          src="https://github.com/thenamespace.png"
          alt="@thenamespace"
        />
        <AvatarFallback>TNS</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src="https://avatars.githubusercontent.com/u/124599?v=4"
          alt="@octocat"
        />
        <AvatarFallback>OC</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
          alt="@john"
        />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Fallbacks: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src="/broken-image.jpg" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/another-broken-image.jpg" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/missing.jpg" />
        <AvatarFallback className="bg-green-500 text-white">+1</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/not-found.jpg" />
        <AvatarFallback className="bg-blue-500 text-white">SK</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const CustomFallbacks: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar className="bg-gradient-to-r from-purple-400 to-pink-400">
        <AvatarFallback className="bg-transparent font-bold text-white">
          JD
        </AvatarFallback>
      </Avatar>
      <Avatar className="bg-gradient-to-r from-blue-400 to-cyan-400">
        <AvatarFallback className="bg-transparent font-bold text-white">
          SM
        </AvatarFallback>
      </Avatar>
      <Avatar className="bg-gradient-to-r from-green-400 to-blue-500">
        <AvatarFallback className="bg-transparent font-bold text-white">
          AB
        </AvatarFallback>
      </Avatar>
      <Avatar className="bg-gradient-to-r from-yellow-400 to-orange-500">
        <AvatarFallback className="bg-transparent font-bold text-white">
          MK
        </AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar className="border-background border-2">
        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar className="border-background border-2">
        <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" />
        <AvatarFallback>MJ</AvatarFallback>
      </Avatar>
      <Avatar className="border-background border-2">
        <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" />
        <AvatarFallback>EM</AvatarFallback>
      </Avatar>
      <Avatar className="border-background border-2">
        <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face" />
        <AvatarFallback>RW</AvatarFallback>
      </Avatar>
      <Avatar className="border-background bg-muted border-2">
        <AvatarFallback>+4</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <div className="flex gap-6">
      <div className="relative">
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="border-background absolute -right-0 -bottom-0 h-3 w-3 rounded-full border-2 bg-green-500"></div>
      </div>

      <div className="relative">
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" />
          <AvatarFallback>MJ</AvatarFallback>
        </Avatar>
        <div className="border-background absolute -right-0 -bottom-0 h-3 w-3 rounded-full border-2 bg-yellow-500"></div>
      </div>

      <div className="relative">
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" />
          <AvatarFallback>EM</AvatarFallback>
        </Avatar>
        <div className="border-background absolute -right-0 -bottom-0 h-3 w-3 rounded-full border-2 bg-gray-400"></div>
      </div>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
      {/* User Profile Card */}
      <div className="border-border space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">John Doe</p>
            <p className="text-muted-foreground text-sm">john@example.com</p>
          </div>
        </div>
      </div>

      {/* Comment */}
      <div className="border-border space-y-3 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback className="text-xs">MJ</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Mike Johnson</p>
              <p className="text-muted-foreground text-xs">2 hours ago</p>
            </div>
            <p className="mt-1 text-sm">
              This looks great! Really love the new design.
            </p>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="border-border space-y-3 rounded-lg border p-4">
        <h3 className="font-medium">Team Members</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" />
                <AvatarFallback className="text-xs">EM</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Emily Miller</p>
                <p className="text-muted-foreground text-xs">Designer</p>
              </div>
            </div>
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face" />
                <AvatarFallback className="text-xs">RW</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Robert Wilson</p>
                <p className="text-muted-foreground text-xs">Developer</p>
              </div>
            </div>
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/thenamespace.png" />
      <AvatarFallback>TNS</AvatarFallback>
    </Avatar>
  ),
};
