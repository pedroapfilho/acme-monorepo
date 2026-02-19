import { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  addons: ["@storybook/addon-a11y", "@storybook/addon-themes"],

  core: {},
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  stories: ["../src/stories/**/*.stories.@(js|jsx|ts|tsx)"],
};

export default config;
