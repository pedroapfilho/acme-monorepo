import { createElement } from "react";

import { svgText } from "./index";

const socialImageSize = { height: 630, width: 1200 };

// Satori renders oklch() fills as black and cannot read CSS variables, so these are the light theme's hex values.
const COLORS = { background: "#ffffff", foreground: "#0a0a0a", mutedForeground: "#737373" };

const socialCard = ({ subtitle, title }: { subtitle: string; title: string }) =>
  createElement(
    "svg",
    { height: socialImageSize.height, viewBox: "0 0 1200 630", width: socialImageSize.width },
    createElement("rect", { fill: COLORS.background, height: 630, width: 1200 }),
    svgText(title, {
      anchor: "middle",
      color: COLORS.foreground,
      size: 96,
      tracking: -2.4,
      x: 600,
      y: 309,
    }),
    svgText(subtitle, {
      anchor: "middle",
      color: COLORS.mutedForeground,
      size: 40,
      width: 1040,
      x: 600,
      y: 389,
    }),
  );

export { socialCard, socialImageSize };
