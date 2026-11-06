import { socialCard, socialImageSize } from "@repo/social-image";
import { ImageResponse } from "next/og";

import { SHORT_DESCRIPTION, SITE_NAME } from "@/lib/site";

const alt = `${SITE_NAME} · ${SHORT_DESCRIPTION}`;
const contentType = "image/png";

const OpengraphImage = () =>
  new ImageResponse(socialCard({ subtitle: SHORT_DESCRIPTION, title: SITE_NAME }), socialImageSize);

export { alt, contentType };

export { socialImageSize as size } from "@repo/social-image";

export default OpengraphImage;
