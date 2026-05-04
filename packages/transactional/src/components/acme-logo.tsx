import { Img } from "react-email";

type AcmeLogoProps = {
  height?: number;
  width?: number;
};

const AcmeLogo = ({ height = 32, width = 120 }: AcmeLogoProps) => {
  return (
    <Img alt="Acme" height={height} src="https://www.acme.com/logo-wordmark.svg" width={width} />
  );
};

export { AcmeLogo };
