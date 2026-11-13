import { displayName } from "@repo/identity";
import { socialCard, socialImageSize } from "@repo/social-image/card";
import { ImageResponse } from "next/og";

import { SHORT_DESCRIPTION } from "@/lib/site";

const alt = `${displayName} · ${SHORT_DESCRIPTION}`;
const contentType = "image/png";

const OpengraphImage = () =>
  new ImageResponse(
    socialCard({ subtitle: SHORT_DESCRIPTION, title: displayName }),
    socialImageSize,
  );

export { alt, contentType };

export { socialImageSize as size } from "@repo/social-image/card";

export default OpengraphImage;
