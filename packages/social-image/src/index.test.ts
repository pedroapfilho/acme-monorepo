import { Children, isValidElement } from "react";
import { describe, expect, it } from "vitest";

import { parseFont, svgText } from "./index";

const positions = (text: string, width: number) => {
  const group = svgText(text, { color: "currentColor", size: 24, width, x: 0, y: 40 });
  return Children.toArray(group.props.children).map((child) => {
    if (!isValidElement<{ transform: string }>(child)) {
      throw new TypeError("Expected a glyph path element");
    }
    const match = /translate\((?<x>\S+) (?<y>\S+)\) scale/v.exec(child.props.transform);
    if (!match?.groups) {
      throw new TypeError(`Unexpected transform: ${child.props.transform}`);
    }
    return { x: Number(match.groups.x), y: Number(match.groups.y) };
  });
};

describe("svgText", () => {
  it("renders accented text as finite glyph coordinates", () => {
    const glyphs = positions("São Paulo · reprodução", 400);
    expect(glyphs.length).toBeGreaterThan(15);
    expect(glyphs.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))).toBe(true);
  });

  it("wraps words and long unbroken titles within the requested measure", () => {
    for (const text of ["A title with several words", "AnExtremelyLongUnbrokenTitle"]) {
      const glyphs = positions(text, 90);
      expect(new Set(glyphs.map(({ y }) => y)).size).toBeGreaterThan(1);
      expect(glyphs.every(({ x }) => x >= 0 && x < 90)).toBe(true);
    }
  });

  it("produces no glyphs for empty text", () => {
    expect(positions("   ", 200)).toEqual([]);
  });
});

describe("parseFont", () => {
  it("rejects corrupt font data", () => {
    expect(() => parseFont(Buffer.from("invalid font"))).toThrow("Unknown font format");
  });
});
