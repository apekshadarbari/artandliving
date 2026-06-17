/**
 * Apeksha Darbari — Brand Colour Palette Board
 *
 * Creates a visual colour palette reference document in Affinity.
 * Because the Affinity SDK does not expose the Swatches panel API,
 * this script generates a visual swatch board you can keep open
 * alongside your document, or use the eyedropper to sample from.
 *
 * To add swatches manually to the Affinity Swatches panel:
 *   View > Studio > Swatches > + (new palette) > enter each hex value below
 *
 * Usage: Run via Affinity MCP execute_script (no document required).
 */

'use strict';

const { Document, NewDocumentOptions, DocumentPreset } = require('/document');
const { AddChildNodesCommandBuilder }                   = require('/commands');
const { ShapeNodeDefinition, FrameTextNodeDefinition, NodeChildType } = require('/nodes');
const { ShapeRectangle }                                = require('/shapes');
const { FillDescriptor }                                = require('/fills');
const { RGBA8 }                                         = require('/colours');
const { BlendMode }                                     = require('affinity:common');
const { Rectangle }                                     = require('/geometry');
const { LineStyleDescriptor }                           = require('/linestyle');
const { Font, FontWidth }                               = require('/fonts');
const { StoryBuilder }                                  = require('/storybuilder');
const { GlyphAtts, GlyphAttDoubleType }                 = require('/glyphatts');

// ── Brand colours ──────────────────────────────────────────────────────────
const BRAND_COLOURS = [
  { name: "AD Midnight",   hex: "#35394c", r: 53,  g: 57,  b: 76  },
  { name: "AD Slate",      hex: "#f2e0d7", r: 242, g: 224, b: 215 },
  { name: "AD Slate Dark", hex: "#e8cfc3", r: 232, g: 207, b: 195 },
  { name: "AD Clay",       hex: "#e57c5f", r: 229, g: 124, b: 95  },
  { name: "AD Clay Light", hex: "#fdf0ec", r: 253, g: 240, b: 236 },
  { name: "AD Teal",       hex: "#176572", r: 23,  g: 101, b: 114 },
  { name: "AD Teal Mid",   hex: "#2a8a9a", r: 42,  g: 138, b: 154 },
  { name: "AD Teal Light", hex: "#e8f4f6", r: 232, g: 244, b: 246 },
  { name: "AD Yellow",     hex: "#f79d26", r: 247, g: 157, b: 38  },
  { name: "AD White",      hex: "#fdfaf8", r: 253, g: 250, b: 248 },
  { name: "AD Text",       hex: "#2a2a2a", r: 42,  g: 42,  b: 42  },
  { name: "AD Text Muted", hex: "#6b6b6b", r: 107, g: 107, b: 107 },
];

// ── Layout ─────────────────────────────────────────────────────────────────
// A4 landscape at 300dpi: 3508 × 2480px
const PX       = 300 / 25.4;      // pixels per mm
const COLS     = 4;
const ROWS     = 3;
const PAD      = Math.round(8 * PX);
const TITLE_H  = Math.round(18 * PX);

// ── Helpers ────────────────────────────────────────────────────────────────
function addRect(doc, x, y, w, h, r, g, b) {
  const fill      = FillDescriptor.createSolid(RGBA8(r, g, b), BlendMode.Normal);
  const noFill    = FillDescriptor.createNone();
  const lineStyle = LineStyleDescriptor.createDefault(0);
  const nodeDef   = ShapeNodeDefinition.create(
    ShapeRectangle.create(), new Rectangle(x, y, w, h), fill, noFill, lineStyle, noFill
  );
  const builder = AddChildNodesCommandBuilder.create();
  builder.addShapeNode(nodeDef);
  doc.executeCommand(builder.createCommand(false, NodeChildType.Main));
}

function addText(doc, x, y, w, h, text, r, g, b, sizePt, italic) {
  const sb   = StoryBuilder.create();
  sb.setToFrameTextDefaultStyle(doc.dpi, doc.format);
  const font = Font.create("Nunito Sans", italic ? 300 : 400, italic || false, new FontWidth());
  const ga   = GlyphAtts.create();
  ga.font    = font;
  ga.setDoubleValue(GlyphAttDoubleType.Height, sizePt * (doc.dpi / 72));
  ga.brushFill = FillDescriptor.createSolid(RGBA8(r, g, b), BlendMode.Normal);
  sb.setGlyphAtts(ga);
  sb.addText(text);
  const nodeDef = FrameTextNodeDefinition.createFromStoryBuilder(new Rectangle(x, y, w, h), sb);
  const builder = AddChildNodesCommandBuilder.create();
  builder.addNode(nodeDef);
  doc.executeCommand(builder.createCommand(false, NodeChildType.Main));
}

// ── Create document ─────────────────────────────────────────────────────────
let a4Preset = null;
for (const p of DocumentPreset.all) {
  if (p.name === 'A4') { a4Preset = p; break; }
}
if (!a4Preset) { console.log("A4 preset not found."); }

const opts        = NewDocumentOptions.createFromPreset(a4Preset);
opts.dpi          = 300;
opts.isLandscape  = true;
const doc         = Document.createFromOptions(opts);

const W = Math.round(doc.widthPixels);
const H = Math.round(doc.heightPixels);

// Dark background
addRect(doc, 0, 0, W, H, 53, 57, 76);

// Title
addText(
  doc, PAD, PAD, W - PAD * 2, TITLE_H,
  "Apeksha Darbari | Art & Living — Brand Palette",
  242, 224, 215, 11, false
);

// Swatch grid
const gridTop  = PAD + TITLE_H + PAD;
const gridW    = W - PAD * 2;
const gridH    = H - gridTop - PAD;
const swatchW  = Math.round((gridW - PAD * (COLS - 1)) / COLS);
const swatchH  = Math.round((gridH - PAD * (ROWS - 1)) / ROWS);
const colorH   = Math.round(swatchH * 0.68);
const labelH   = swatchH - colorH;

for (let i = 0; i < BRAND_COLOURS.length; i++) {
  const c   = BRAND_COLOURS[i];
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const x   = PAD + col * (swatchW + PAD);
  const y   = gridTop + row * (swatchH + PAD);

  // Colour block
  addRect(doc, x, y, swatchW, colorH, c.r, c.g, c.b);

  // Label background (slightly lighter than midnight)
  addRect(doc, x, y + colorH, swatchW, labelH, 68, 73, 96);

  // Name + hex label
  const isLight = (c.r * 0.299 + c.g * 0.587 + c.b * 0.114) > 140;
  addText(
    doc,
    x + Math.round(2 * PX),
    y + colorH + Math.round(2 * PX),
    swatchW - Math.round(4 * PX),
    labelH - Math.round(2 * PX),
    c.name + "\n" + c.hex,
    242, 224, 215, 6.5, false  // Slate, 6.5pt
  );

  console.log("Swatch: " + c.name + "  " + c.hex);
}

// ── Console cheat sheet ─────────────────────────────────────────────────────
console.log("\n── Brand colours (for Affinity Swatches panel) ──");
for (const c of BRAND_COLOURS) {
  console.log(c.name.padEnd(18) + c.hex);
}
console.log("\nTo add manually: View > Studio > Swatches > + > enter hex");
console.log("Palette board created. Keep this doc open as a colour reference.");
