import "@repo/ui/styles.css";
import { Preview } from "@storybook/react";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className="antialiased">
        <Story />
      </div>
    ),
  ],
};

export default preview;
