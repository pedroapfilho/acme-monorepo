import { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    {
      name: "@storybook/addon-essentials",
      options: {
        actions: false,
      },
    },
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  core: {},
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../public"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
