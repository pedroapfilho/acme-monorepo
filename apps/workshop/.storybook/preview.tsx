import {
  DEFAULT_THEME,
  withTailwindTheme,
} from "./withTailwindTheme.decorator";
import "@/styles.css";
import "@repo/ui/styles.css";
import { Preview } from "@storybook/react";
import React from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: DEFAULT_THEME,
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light", left: "🌞" },
          { value: "dark", title: "Dark", left: "🌛" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="antialiased">
        <Story />
      </div>
    ),
    (story) => {
      const router = createMemoryRouter([{ path: "/", element: story() }], {
        initialEntries: ["/"],
      });

      return <RouterProvider router={router} />;
    },
    withTailwindTheme,
  ],
};

export default preview;
