import "server-only";
import type { ValidatedDocument } from "@/lib/documents/validation";

export type ExtractedPageText = {
  pageNumber: number;
  text: string;
};

export async function extractLocalPageText(document: ValidatedDocument): Promise<ExtractedPageText[]> {
  if (document.mimeType !== "application/pdf") {
    return [{ pageNumber: 1, text: "" }];
  }
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({
      data: document.bytes.slice(),
      disableFontFace: true,
      useSystemFonts: false,
    });
    const pdf = await loadingTask.promise;
    const pages: ExtractedPageText[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .filter(Boolean)
        .join(" ");
      pages.push({ pageNumber, text });
    }
    await loadingTask.destroy();
    return pages;
  } catch {
    return Array.from({ length: document.pageCount }, (_, index) => ({ pageNumber: index + 1, text: "" }));
  }
}
