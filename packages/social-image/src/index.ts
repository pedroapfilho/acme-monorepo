import { create, type Font, type GlyphRun } from "fontkit";
import { createElement } from "react";

import geist from "./fonts/geist.json" with { type: "json" };

const parseFont = (data: Buffer): Font => {
  const font = create(data);
  if (!("layout" in font)) {
    throw new TypeError("Social images require a single font face");
  }
  return font;
};

const fontData = Buffer.from(geist.base64, "base64");
const defaultFont = parseFont(fontData);

type SvgTextOptions = {
  anchor?: "start" | "middle" | "end";
  color: string;
  font?: Font;
  lineHeight?: number;
  size: number;
  tracking?: number;
  width?: number;
  x: number;
  y: number;
};

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

const svgText = (
  text: string,
  {
    anchor = "start",
    color,
    font = defaultFont,
    lineHeight = 1.2,
    size,
    tracking = 0,
    width,
    x,
    y,
  }: SvgTextOptions,
) => {
  const scale = size / font.unitsPerEm;
  const runWidth = (run: GlyphRun) =>
    run.advanceWidth * scale + Math.max(0, run.glyphs.length - 1) * tracking;
  const measure = (value: string) => runWidth(font.layout(value));
  const lines: Array<string> = [];
  let line = "";
  for (const word of text.trim().split(/\s+/v)) {
    const next = line ? `${line} ${word}` : word;
    if (width === undefined || measure(next) <= width) {
      line = next;
      continue;
    }
    if (line) {
      lines.push(line);
      line = "";
    }
    for (const { segment } of segmenter.segment(word)) {
      if (line && measure(line + segment) > width) {
        lines.push(line);
        line = "";
      }
      line += segment;
    }
  }
  if (line) {
    lines.push(line);
  }

  const paths = lines.flatMap((value, lineIndex) => {
    const run = font.layout(value);
    const lineWidth = runWidth(run);
    const offsets = { end: lineWidth, middle: lineWidth / 2, start: 0 };
    const offset = offsets[anchor];
    let cursor = x - offset;
    return run.glyphs.map((glyph, glyphIndex) => {
      const position = run.positions[glyphIndex];
      if (position === undefined) {
        throw new Error(`svgText: glyph ${glyphIndex} of "${value}" has no position`);
      }
      const glyphX = cursor + position.xOffset * scale;
      const glyphY = y + lineIndex * size * lineHeight - position.yOffset * scale;
      cursor += position.xAdvance * scale + tracking;
      return createElement("path", {
        d: glyph.path.toSVG(),
        key: `${lineIndex}-${glyphIndex}`,
        transform: `translate(${glyphX} ${glyphY}) scale(${scale} ${-scale})`,
      });
    });
  });
  return createElement("g", { fill: color }, paths);
};

export { parseFont, svgText };
