import { svgText } from "@repo/social-image";
import { ImageResponse } from "next/og";

import { SHORT_DESCRIPTION, SITE_NAME } from "@/lib/site";

const alt = `${SITE_NAME} · ${SHORT_DESCRIPTION}`;
const size = { height: 630, width: 1200 };
const contentType = "image/png";
const COLORS = { background: "#ffffff", foreground: "#0a0a0a", mutedForeground: "#737373" };
const OpengraphImage = () =>
  new ImageResponse(
    <svg height={630} viewBox="0 0 1200 630" width={1200}>
      <rect fill={COLORS.background} height={630} width={1200} />
      {svgText(SITE_NAME, {
        anchor: "middle",
        color: COLORS.foreground,
        size: 96,
        tracking: -2.4,
        x: 600,
        y: 309,
      })}
      {svgText(SHORT_DESCRIPTION, {
        anchor: "middle",
        color: COLORS.mutedForeground,
        size: 40,
        width: 1040,
        x: 600,
        y: 389,
      })}
    </svg>,
    size,
  );
export { alt, contentType, size };
export default OpengraphImage;
