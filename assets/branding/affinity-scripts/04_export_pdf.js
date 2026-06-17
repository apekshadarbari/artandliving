/**
 * Apeksha Darbari — Export to PDF
 *
 * Exports the current Affinity document as a web-optimised PDF for
 * digital delivery via Stan Store.
 *
 * The PDF is saved alongside the .afpub file with _EXPORT appended:
 *   ad_you_have_permission_v2.afpub  →  ad_you_have_permission_v2_EXPORT.pdf
 *
 * Usage: Save your document first (File > Save), then run via Affinity MCP.
 *
 * Preset used: "PDF (digital - high quality)"
 *   • RGB colour space
 *   • Fonts embedded
 *   • Hyperlinks preserved (for interactive menu pages)
 *   • Optimised for screen, not print
 *
 * To export at print-quality (300dpi) instead, change PRESET below.
 */

'use strict';

const { Document, FileExportOptions } = require('/document');
const { EnumerationResult }           = require('affinity:common');

// ── Config ─────────────────────────────────────────────────────────────────
// Available PDF presets (run FileExportOptions.enumeratePresetNames to see all):
//   "PDF (digital - small size)"    — smaller file, good for preview links
//   "PDF (digital - high quality)"  — recommended for delivery
//   "PDF (for print)"               — CMYK, 300dpi, for print-at-home versions
const PRESET = "PDF (digital - high quality)";

// ── Export ─────────────────────────────────────────────────────────────────
const doc = Document.current;
if (!doc) {
  console.log("No document is open.");
  throw new Error("No open document");
}

const srcPath = doc.path;
if (!srcPath) {
  console.log("Document has not been saved yet.");
  console.log("Please save it first: File > Save  →  then re-run this script.");
  throw new Error("Document not saved");
}

// Derive output path: replace .afpub extension (or append _EXPORT.pdf)
const pdfPath = srcPath.replace(/\.(afpub|afdesign|afphoto)$/i, "_EXPORT.pdf");
const outputPath = pdfPath === srcPath ? srcPath + "_EXPORT.pdf" : pdfPath;

console.log("Document: " + doc.title);
console.log("Preset:   " + PRESET);
console.log("Output:   " + outputPath);
console.log("");

// Create export options from preset
const exportOptions = FileExportOptions.createWithPresetName(PRESET);

// Run export
const exportRecords = doc.export(outputPath, exportOptions, null, null);

// Report results
let success = true;
exportRecords.enumerate((record) => {
  if (record.isSuccess) {
    console.log("✓  Exported: " + record.path);
    if (record.hasWarnings) {
      console.log("   Warnings: " + record.warningString);
    }
  } else {
    success = false;
    try {
      const err = record.errorMessage;
      console.log("✗  Export failed: " + err.title + " — " + err.reason);
    } catch (e) {
      console.log("✗  Export failed (no error details available).");
    }
  }
  return EnumerationResult.Continue;
});

if (success) {
  console.log("\n✓  PDF ready for Stan Store upload.");
  console.log("   Upload path: " + outputPath);
  console.log("\nStan Store checklist:");
  console.log("  • Log in → go to the product → Replace file");
  console.log("  • Upload the _EXPORT.pdf");
  console.log("  • Use the preview link to verify the download and links");
} else {
  console.log("\nExport encountered errors. Check the messages above.");
  console.log("You can also export manually: File > Export > PDF > " + PRESET);
}
