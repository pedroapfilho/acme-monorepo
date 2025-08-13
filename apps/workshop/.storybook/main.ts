import { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: ["@storybook/addon-a11y", "@storybook/addon-themes"],
  core: {},
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
