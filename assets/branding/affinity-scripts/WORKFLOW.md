# Affinity Publisher PDF Workflow
*Apeksha Darbari | Art & Living*

---

## One-time Setup (do this once)

### 1. Install fonts
Download from Google Fonts and install on your Mac:
- **Playfair Display** — https://fonts.google.com/specimen/Playfair+Display
- **Nunito Sans** — https://fonts.google.com/specimen/Nunito+Sans

### 2. Enable Affinity MCP
Open Affinity → Settings → MCP → Enable MCP server

### 3. Run the brand setup scripts (via Claude or Affinity Script panel)
With any document open, run in order:
1. `01_setup_colour_swatches.js` — loads all 12 brand colours into the swatch panel
2. `02_setup_text_styles.js` — creates all paragraph styles (AD Cover Title, AD Body, etc.)

Once run on one document, you can copy the swatches and styles to all future documents by saving a master template.

---

## Per-product workflow

### Step 1 — Create the document
Run `03_create_pdf_template.js` with `PRODUCT_TYPE` set to your product:
- `"you_have_permission"` — 10-page A5, Midnight/Slate/Clay
- `"love_letter"` — 6-page A5, Slate/Midnight/Clay
- `"mood_deck"` — 15-page A5, White/Midnight/Teal

The script creates the document with:
- Correct page count
- Background colour on every spread
- Header / content / footer text frames
- Clay accent bar on interior pages

### Step 2 — Place the cover painting
- File > Place on the cover spread
- Painting files are in `assets/paintings/`
- Fit to full bleed (extend to page edges, 0 bleed margin for digital)
- For *You Have Permission*: use the Permission painting (third painting, made with agenda of play)

### Step 3 — Add the logo
- Cover and back page: place the full logotype SVG from `assets/branding/`
- Use **slate** variant on dark (Midnight) backgrounds
- Use **midnight** variant on light (Slate/White) backgrounds
- Recommended size: 24mm wide on A5

### Step 4 — Flow copy
All copy is Apeksha's own — never rewrite, paraphrase, or substitute.
- Apply paragraph styles from the `AD` style group (set up in Step 1)
- Permission statements → `AD Permission Statement`
- Body paragraphs → `AD Body` or `AD Body — On Dark`
- Page eyebrows (e.g. "permission to") → `AD Eyebrow`
- Pull quotes and poetry → `AD Pull Quote` or `AD Pull Quote — Light`

### Step 5 — Internal links (Mood Deck / Permission Deck)
- Select the text or button shape
- Insert > Hyperlink > Page (choose destination spread)
- For the Menu page: link each permission title to its card spread

### Step 6 — Review checklist
Before export:
- [ ] All copy matches final approved version exactly
- [ ] Fonts embedded (check via Document > Preflight)
- [ ] No overset text (red overflow indicator on any frame)
- [ ] Logo present on cover and back
- [ ] Internal links tested (click through in Preview mode)
- [ ] Spelling: British/Canadian (colour, honour, nourishment — no "wellness")
- [ ] Back page: brand + website URL + Instagram handle

### Step 7 — Export PDF
Run `04_export_pdf.js`, or manually:
- File > Export > PDF
- Preset: **PDF (for Web)**
- Colour space: RGB
- Resolution: 150 DPI (digital), 300 DPI if offering print-at-home
- Embed fonts: Yes
- Include hyperlinks: Yes

### Step 8 — Upload to Stan Store
- Log into Stan Store
- Go to the product → Replace file
- Upload the `_EXPORT.pdf`
- Test purchase or use the preview link to verify the download

---

## Colour cheat sheet (for quick reference in Affinity)

| Swatch name       | Use when                              |
|-------------------|---------------------------------------|
| AD Midnight       | Dark page background, headings on light |
| AD Slate          | Blush page background, text on dark   |
| AD Clay           | Accents, CTAs, eyebrows, borders      |
| AD Teal           | Secondary accent, links, poem text    |
| AD White          | Clean/airy backgrounds                |
| AD Clay Light     | Soft warm section fill                |

---

## File naming convention

```
ad_[product]_v[n].afpub           ← working file
ad_[product]_v[n]_EXPORT.pdf      ← exported PDF (auto-named by script)
```

Examples:
- `ad_you_have_permission_v2.afpub`
- `ad_love_letter_v3_EXPORT.pdf`

---

## When Claude is connected to Affinity

With Affinity open and MCP enabled, Claude can:
- Run any of the above scripts directly (no copy/paste needed)
- Inspect the current document's spreads, frames, and styles
- Diagnose layout issues (overset text, missing fonts)
- Re-run the export script on command
- Save scripts to Affinity's script library for one-click reuse

Just say: *"Open Affinity, run the colour swatches script"* or *"Export the current document as PDF"*.
