"use client";

import { Button } from "ui";

const Footer = () => {
  return (
    <footer className="border-t">
      <Button
        className="m-4"
        onClick={() => {
          console.log("clicked");
        }}
      >
        Click me
      </Button>
    </footer>
  );
};

export default Footer;
