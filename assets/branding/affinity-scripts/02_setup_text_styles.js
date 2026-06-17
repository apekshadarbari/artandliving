/**
 * Apeksha Darbari — Typography Specimen Sheet
 *
 * The Affinity SDK does not expose the Paragraph Styles panel API,
 * so named paragraph styles cannot be created programmatically.
 * This script creates a visual typography reference document instead —
 * showing every brand text style applied to sample text.
 *
 * Keep the reference open while designing, or use it to manually
 * recreate each style in the Text Styles panel (Text > Text Styles).
 *
 * Fonts required (install from Google Fonts before running):
 *   • Playfair Display — https://fonts.google.com/specimen/Playfair+Display
 *   • Nunito Sans      — https://fonts.google.com/specimen/Nunito+Sans
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
const { ParagraphAtts, ParagraphAlignXType }            = require('/paragraphatts');

// ── Colour tokens ──────────────────────────────────────────────────────────
const C = {
  midnight:  [53,  57,  76],
  slate:     [242, 224, 215],
  clay:      [229, 124, 95],
  teal:      [23,  101, 114],
  white:     [253, 250, 248],
  text:      [42,  42,  42],
  muted:     [107, 107, 107],
};

// ── Type scale definitions ─────────────────────────────────────────────────
// sizePt: point size at 300dpi  |  weight: 400 = Regular, 300 = Light, 700 = Bold
const STYLES = [
  // Display (Playfair Display)
  { name: "AD Cover Title",         family: "Playfair Display", sizePt: 48, weight: 400, italic: false, color: C.slate,    sampleText: "You Have Permission",   bg: C.midnight },
  { name: "AD Permission Statement",family: "Playfair Display", sizePt: 32, weight: 400, italic: false, color: C.slate,    sampleText: "permission to rest",    bg: C.midnight },
  { name: "AD Section Heading",     family: "Playfair Display", sizePt: 24, weight: 400, italic: false, color: C.midnight, sampleText: "How Are You Making?",   bg: C.white    },
  { name: "AD Pull Quote",          family: "Playfair Display", sizePt: 17, weight: 400, italic: true,  color: C.teal,     sampleText: "art as nourishment",    bg: C.white    },
  { name: "AD Pull Quote — Light",  family: "Playfair Display", sizePt: 17, weight: 400, italic: true,  color: C.slate,    sampleText: "art as nourishment",    bg: C.midnight },
  // Body & UI (Nunito Sans)
  { name: "AD Body",                family: "Nunito Sans",       sizePt: 10.5, weight: 300, italic: false, color: C.text,   sampleText: "Creativity is nourishment for the soul.", bg: C.white    },
  { name: "AD Body — On Dark",      family: "Nunito Sans",       sizePt: 10.5, weight: 300, italic: false, color: C.slate,  sampleText: "Creativity is nourishment for the soul.", bg: C.midnight },
  { name: "AD Caption",             family: "Nunito Sans",       sizePt: 8.5,  weight: 400, italic: false, color: C.muted,  sampleText: "Apeksha Darbari | Art & Living",         bg: C.white    },
  { name: "AD Eyebrow",             family: "Nunito Sans",       sizePt: 7.5,  weight: 400, italic: false, color: C.clay,   sampleText: "PERMISSION TO",                          bg: C.midnight },
  { name: "AD CTA",                 family: "Nunito Sans",       sizePt: 8.5,  weight: 400, italic: false, color: C.midnight,sampleText: "EXPLORE THE DECK →",                    bg: C.slate    },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const PX = 300 / 25.4;

function addRect(doc, x, y, w, h, rgb) {
  const fill      = FillDescriptor.createSolid(RGBA8(...rgb), BlendMode.Normal);
  const noFill    = FillDescriptor.createNone();
  const lineStyle = LineStyleDescriptor.createDefault(0);
  const nodeDef   = ShapeNodeDefinition.create(
    ShapeRectangle.create(), new Rectangle(x, y, w, h), fill, noFill, lineStyle, noFill
  );
  const builder = AddChildNodesCommandBuilder.create();
  builder.addShapeNode(nodeDef);
  doc.executeCommand(builder.createCommand(false, NodeChildType.Main));
}

function addStyledText(doc, x, y, w, h, text, family, sizePt, weight, italic, colorRgb) {
  const sb   = StoryBuilder.create();
  sb.setToFrameTextDefaultStyle(doc.dpi, doc.format);
  const font = Font.create(family, weight, italic, new FontWidth());
  const ga   = GlyphAtts.create();
  ga.font    = font;
  ga.setDoubleValue(GlyphAttDoubleType.Height, sizePt * (doc.dpi / 72));
  ga.brushFill = FillDescriptor.createSolid(RGBA8(...colorRgb), BlendMode.Normal);
  sb.setGlyphAtts(ga);
  sb.addText(text);
  const nodeDef = FrameTextNodeDefinition.createFromStoryBuilder(new Rectangle(x, y, w, h), sb);
  const builder = AddChildNodesCommandBuilder.create();
  builder.addNode(nodeDef);
  doc.executeCommand(builder.createCommand(false, NodeChildType.Main));
}

function addLabel(doc, x, y, w, h, text) {
  // Small grey label — style name annotation
  addStyledText(doc, x, y, w, h, text, "Nunito Sans", 7, 400, false, C.muted);
}

// ── Create A4 document ──────────────────────────────────────────────────────
let a4Preset = null;
for (const p of DocumentPreset.all) {
  if (p.name === 'A4') { a4Preset = p; break; }
}

const opts    = NewDocumentOptions.createFromPreset(a4Preset);
opts.dpi      = 300;
const doc     = Document.createFromOptions(opts);

const W = Math.round(doc.widthPixels);
const H = Math.round(doc.heightPixels);

// Page background: very light warm white
addRect(doc, 0, 0, W, H, C.white);

// Title banner
const BANNER_H = Math.round(22 * PX);
addRect(doc, 0, 0, W, BANNER_H, C.midnight);
addStyledText(
  doc, Math.round(10 * PX), Math.round(4 * PX),
  W - Math.round(20 * PX), BANNER_H - Math.round(4 * PX),
  "Apeksha Darbari | Art & Living — Typography Reference",
  "Nunito Sans", 10, 400, false, C.slate
);

// ── Lay out each style sample ──────────────────────────────────────────────
const PAD       = Math.round(8 * PX);
const ROW_H     = Math.round(22 * PX);    // height per style sample row
const LABEL_H   = Math.round(5 * PX);
const SAMPLE_H  = ROW_H - LABEL_H - Math.round(2 * PX);
const X         = PAD;
const TEXT_W    = W - PAD * 2;

let curY = BANNER_H + PAD;

for (const s of STYLES) {
  if (curY + ROW_H > H - PAD) break; // guard against overflow

  // Background for this sample
  addRect(doc, X, curY, TEXT_W, ROW_H, s.bg);

  // Style name annotation (above)
  addLabel(doc, X + Math.round(2 * PX), curY + Math.round(1 * PX),
           TEXT_W, LABEL_H,
           s.name + "  ·  " + s.family + "  " + s.sizePt + "pt");

  // Sample text
  addStyledText(
    doc,
    X + Math.round(3 * PX),
    curY + LABEL_H,
    TEXT_W - Math.round(6 * PX),
    SAMPLE_H,
    s.sampleText,
    s.family, s.sizePt, s.weight, s.italic, s.color
  );

  curY += ROW_H + Math.round(3 * PX);
  console.log("Style added: " + s.name);
}

// Footer note
addStyledText(
  doc,
  PAD, H - Math.round(18 * PX), W - PAD * 2, Math.round(15 * PX),
  "All copy is Apeksha's own — never rewrite, paraphrase, or substitute.  |  British/Canadian spelling throughout.",
  "Nunito Sans", 7, 400, true, C.muted
);

console.log("\n✓ Typography reference sheet created.");
console.log("\nTo create named styles in Affinity:");
console.log("  1. Select a styled text frame above");
console.log("  2. Text > Text Styles > Create from Selection");
console.log("  3. Name it using the style name shown (e.g. \"AD Cover Title\")");
console.log("  4. Save to a template for reuse across all products");
