import React, { useEffect } from "react";

const DEFAULT_THEME = "light";

const withTailwindTheme = (Story, context) => {
  const { theme } = context.globals;

  useEffect(() => {
    const htmlTag = document.documentElement;

    htmlTag.setAttribute("data-mode", theme || DEFAULT_THEME);
  }, [theme]);

  return <Story />;
};

export { withTailwindTheme, DEFAULT_THEME };
