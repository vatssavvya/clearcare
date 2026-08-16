import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const sourcePath = path.join(root, "lib", "mock", "comprehensive-sample-pages.json");
const outputDir = path.join(root, "public", "samples");
const outputPath = path.join(outputDir, "clearcare-comprehensive-sample.pdf");

const source = JSON.parse(await readFile(sourcePath, "utf8"));
const pdf = await PDFDocument.create();
pdf.setTitle(source.title);
pdf.setSubject("Synthetic ClearCare comprehensive discharge-summary fixture");
pdf.setAuthor("ClearCare hackathon project");
pdf.setCreator("ClearCare reproducible sample generator");
pdf.setProducer("pdf-lib");

const regular = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const navy = rgb(0.055, 0.125, 0.2);
const teal = rgb(0.05, 0.42, 0.4);
const ink = rgb(0.12, 0.16, 0.2);
const muted = rgb(0.36, 0.42, 0.46);
const paper = rgb(0.985, 0.98, 0.96);
const amber = rgb(0.96, 0.74, 0.28);

function wrap(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

for (const pageData of source.pages) {
  const page = pdf.addPage([612, 792]);
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: 0, width, height, color: paper });
  page.drawRectangle({ x: 0, y: height - 82, width, height: 82, color: navy });
  page.drawRectangle({ x: 44, y: height - 97, width: 116, height: 24, color: amber, borderRadius: 5 });
  page.drawText("FICTIONAL SAMPLE", { x: 53, y: height - 90, size: 9, font: bold, color: navy });
  page.drawText("CLEARCARE", { x: 44, y: height - 42, size: 18, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Discharge summary", { x: 44, y: height - 64, size: 11, font: regular, color: rgb(0.78, 0.9, 0.89) });
  page.drawText(`PAGE ${pageData.pageNumber} OF ${source.pages.length}`, {
    x: width - 114,
    y: height - 48,
    size: 9,
    font: bold,
    color: rgb(0.78, 0.9, 0.89),
  });

  let y = height - 124;
  for (const section of pageData.sections) {
    page.drawText(section.heading, { x: 44, y, size: 10.2, font: bold, color: teal });
    y -= 17;
    for (const block of section.blocks) {
      const lines = wrap(block, regular, 9.35, width - 88);
      for (const line of lines) {
        page.drawText(line, { x: 44, y, size: 9.35, font: regular, color: ink });
        y -= 12.3;
      }
      y -= 6;
    }
    y -= 7;
  }

  if (pageData.footerNote) {
    page.drawRectangle({ x: 44, y: 42, width: width - 88, height: 34, color: rgb(0.96, 0.93, 0.82) });
    page.drawText(pageData.footerNote, { x: 55, y: 55, size: 8.5, font: bold, color: navy });
  }
  page.drawLine({ start: { x: 44, y: 28 }, end: { x: width - 44, y: 28 }, thickness: 0.5, color: rgb(0.8, 0.82, 0.82) });
  page.drawText("Synthetic demonstration only - not for clinical use", { x: 44, y: 14, size: 7.5, font: regular, color: muted });
}

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, await pdf.save());
console.log(`Generated ${path.relative(root, outputPath)} (${source.pages.length} pages)`);
