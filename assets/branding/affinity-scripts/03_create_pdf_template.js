/**
 * Apeksha Darbari — A5 Branded PDF Template
 *
 * Creates a fully structured multi-page Affinity Publisher document for
 * any of the three digital products. Each spread gets:
 *   • Full-bleed background rectangle
 *   • Header zone (eyebrow / page label)
 *   • Main content text frame
 *   • Footer zone (logo + URL placeholder)
 *   • Clay accent bar on interior pages
 *
 * ── Products ──────────────────────────────────────────────────────────────
 *   "you_have_permission"  10 pages  Midnight bg, Slate text, Clay accents
 *   "love_letter"           6 pages  Slate bg, Midnight text, Clay accents
 *   "mood_deck"            15 pages  White bg, Midnight text, Teal accents
 *
 * Usage: Set PRODUCT_TYPE below, then run via Affinity MCP execute_script.
 * Save the result as ad_[product]_v1.afpub.
 *
 * Fonts required (install from Google Fonts first):
 *   • Playfair Display — https://fonts.google.com/specimen/Playfair+Display
 *   • Nunito Sans      — https://fonts.google.com/specimen/Nunito+Sans
 */

'use strict';

// ── Choose product ─────────────────────────────────────────────────────────
const PRODUCT_TYPE = "you_have_permission"; // ← change before running

// ── Imports ────────────────────────────────────────────────────────────────
const { Document, NewDocumentOptions, DocumentPreset } = require('/document');
const { AddChildNodesCommandBuilder, DocumentCommand } = require('/commands');
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

// ── Colour tokens (r, g, b) ────────────────────────────────────────────────
const MIDNIGHT   = [53,  57,  76];
const SLATE      = [242, 224, 215];
const CLAY       = [229, 124, 95];
const CLAY_LIGHT = [253, 240, 236];
const TEAL       = [23,  101, 114];
const WHITE      = [253, 250, 248];
const TEXT       = [42,  42,  42];
const MUTED      = [107, 107, 107];

// ── Product themes ─────────────────────────────────────────────────────────
const THEMES = {
  you_have_permission: {
    label:   "You Have Permission",
    bg:      MIDNIGHT,
    text:    SLATE,
    accent:  CLAY,
    logo:    "apeksha-darbari_logotype-tagline_slate.svg",
    pages: [
      "Cover", "Letter", "Menu",
      "Permission 1", "Permission 2", "Permission 3",
      "Permission 4", "Permission 5", "Permission 6",
      "Back"
    ],
  },
  love_letter: {
    label:   "Love Letter",
    bg:      SLATE,
    text:    MIDNIGHT,
    accent:  CLAY,
    logo:    "apeksha-darbari_logotype-tagline_midnight.svg",
    pages: ["Cover", "Page 1", "Page 2", "Page 3", "Page 4", "Back"],
  },
  mood_deck: {
    label:   "Mood Prompt Art Deck",
    bg:      WHITE,
    text:    MIDNIGHT,
    accent:  TEAL,
    logo:    "apeksha-darbari_logotype-tagline_midnight.svg",
    pages: [
      "Cover", "Intro",
      "Card 1",  "Card 2",  "Card 3",  "Card 4",
      "Card 5",  "Card 6",  "Card 7",  "Card 8",
      "Card 9",  "Card 10", "Card 11", "Card 12",
      "Back"
    ],
  },
};

// ── A5 at 300dpi ───────────────────────────────────────────────────────────
// Dimensions are computed from doc.widthPixels / doc.heightPixels after creation.
// All layout values are derived from mm × (300/25.4) = pixels.
const MM   = 300 / 25.4;         // pixels per mm
const M    = Math.round(14 * MM); // outer margin: 14mm
const MI   = Math.round(16 * MM); // inner/binding margin: 16mm
const BAR  = Math.round(2  * MM); // accent bar width: 2mm
const BAR_X = MI - Math.round(6 * MM); // accent bar left edge

// ── Helpers ────────────────────────────────────────────────────────────────
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

function addTextFrame(doc, x, y, w, h, placeholderText, family, sizePt, weight, italic, rgb) {
  const sb   = StoryBuilder.create();
  sb.setToFrameTextDefaultStyle(doc.dpi, doc.format);
  const font = Font.create(family, weight, italic, new FontWidth());
  const ga   = GlyphAtts.create();
  ga.font    = font;
  ga.setDoubleValue(GlyphAttDoubleType.Height, sizePt * (doc.dpi / 72));
  ga.brushFill = FillDescriptor.createSolid(RGBA8(...rgb), BlendMode.Normal);
  sb.setGlyphAtts(ga);
  sb.addText(placeholderText);
  const nodeDef = FrameTextNodeDefinition.createFromStoryBuilder(new Rectangle(x, y, w, h), sb);
  const builder = AddChildNodesCommandBuilder.create();
  builder.addNode(nodeDef);
  doc.executeCommand(builder.createCommand(false, NodeChildType.Main));
}

function addEmptyFrame(doc, x, y, w, h, rgb) {
  // An empty text frame (no placeholder text — for body copy)
  addTextFrame(doc, x, y, w, h, "", "Nunito Sans", 10.5, 300, false, rgb);
}

// ── Validate ───────────────────────────────────────────────────────────────
const theme = THEMES[PRODUCT_TYPE];
if (!theme) {
  console.log("Unknown PRODUCT_TYPE: \"" + PRODUCT_TYPE + "\"");
  console.log("Valid options: " + Object.keys(THEMES).join(", "));
  throw new Error("Invalid product type");
}

// ── Create document ─────────────────────────────────────────────────────────
let a5Preset = null;
for (const p of DocumentPreset.all) {
  if (p.name === 'A5') { a5Preset = p; break; }
}
if (!a5Preset) throw new Error("A5 preset not found");

const opts        = NewDocumentOptions.createFromPreset(a5Preset);
opts.dpi          = 300;
opts.isMultiPage  = true;
opts.isFacing     = false;           // single-page spreads (digital PDF)
opts.pageCount    = theme.pages.length;
const doc         = Document.createFromOptions(opts);

const W = Math.round(doc.widthPixels);
const H = Math.round(doc.heightPixels);

console.log("Creating: " + theme.label);
console.log("Pages: " + theme.pages.length + "  |  Size: " + W + " × " + H + "px");
console.log("");

// ── Set up each spread ──────────────────────────────────────────────────────
let spreadIndex = 0;
for (const spread of doc.spreads) {
  const pageName = theme.pages[spreadIndex] || ("Page " + (spreadIndex + 1));
  const isInterior = pageName !== "Cover" && pageName !== "Back";

  // Navigate to this spread before adding nodes
  doc.executeCommand(DocumentCommand.createSetCurrentSpread(spread));

  // 1. Full-bleed background
  addRect(doc, 0, 0, W, H, theme.bg);

  // 2. Header zone — eyebrow / page label
  const headerH = Math.round(8 * MM);
  addTextFrame(
    doc,
    MI, M,
    W - MI - M, headerH,
    isInterior ? pageName.toUpperCase() : "",
    "Nunito Sans", 7.5, 400, false, theme.accent
  );

  // 3. Main content frame
  const contentY  = M + headerH + Math.round(4 * MM);
  const footerH   = Math.round(10 * MM);
  const contentH  = H - contentY - footerH - M;
  addEmptyFrame(doc, MI, contentY, W - MI - M, contentH, theme.text);

  // 4. Footer zone — logo + URL placeholder
  addTextFrame(
    doc,
    M, H - M - footerH,
    W - M * 2, footerH,
    "apekshadarbari.com  @apekshadarbari",
    "Nunito Sans", 7.5, 400, false, theme.text
  );

  // 5. Clay accent bar (interior pages only)
  if (isInterior) {
    addRect(doc, BAR_X, contentY, BAR, contentH, theme.accent);
  }

  console.log("✓  Spread " + (spreadIndex + 1) + ": " + pageName);
  spreadIndex++;
}

// ── Done ────────────────────────────────────────────────────────────────────
console.log("\n✓  Template ready: " + theme.label);
console.log("\nNext steps:");
console.log("  1. File > Save  →  ad_" + PRODUCT_TYPE + "_v1.afpub");
console.log("  2. Cover spread: File > Place → add the painting image");
console.log("  3. Logo: place " + theme.logo + " in the footer zone");
console.log("  4. Flow your copy into the content frames");
console.log("  5. Add internal links (Insert > Hyperlink) on menu/card pages");
console.log("  6. Run 04_export_pdf.js when ready to export");
console.log("\nLogo path: assets/branding/02_Logotype (with tagline)/" + theme.logo);
