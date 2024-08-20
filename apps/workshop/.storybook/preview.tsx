import "@repo/ui/styles.css";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { Preview, ReactRenderer } from "@storybook/react";
import React from "react";

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute<ReactRenderer>({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
      attributeName: "data-mode",
    }),
    (Story) => (
      <div className="antialiased">
        <Story />
      </div>
    ),
  ],
};

export default preview;
