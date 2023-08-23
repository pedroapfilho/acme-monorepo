import { StorybookConfig } from "@storybook/react-vite";
import { dirname, join } from "path";

const getAbsolutePath = (value: string): any => {
  return dirname(require.resolve(join(value, "package.json")));
};

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    {
      name: "@storybook/addon-essentials",
      options: {
        actions: false,
      },
    },
    getAbsolutePath("@storybook/addon-a11y"),
  ],
  core: {},
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../public"],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
};

export default config;
