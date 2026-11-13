import { displayName, origins } from "@repo/identity";
import { Img } from "react-email";

const Logo = () => (
  <Img alt={displayName} height={28} src={`${origins.landing}/logo-wordmark.svg`} width={104} />
);

export { Logo };
