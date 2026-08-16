// @vitest-environment node

import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { DocumentValidationError, MAX_FILE_BYTES, validateDocument } from "@/lib/documents/validation";

async function pdfBytes(pageCount = 1) {
  const pdf = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) pdf.addPage();
  const bytes = await pdf.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("server document validation", () => {
  it("accepts a readable PDF and counts pages", async () => {
    const file = new File([await pdfBytes(2)], "sample.pdf", { type: "application/pdf" });
    const result = await validateDocument(file);
    expect(result.pageCount).toBe(2);
    expect(result.safeFilename).toBe("clearcare-document.pdf");
  });

  it("rejects unsupported extensions", async () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    await expect(validateDocument(file)).rejects.toMatchObject({ code: "unsupported_file" } satisfies Partial<DocumentValidationError>);
  });

  it("rejects MIME/signature mismatch", async () => {
    const file = new File([await pdfBytes()], "sample.png", { type: "image/png" });
    await expect(validateDocument(file)).rejects.toMatchObject({ code: "mime_mismatch" } satisfies Partial<DocumentValidationError>);
  });

  it("rejects corrupt content", async () => {
    const file = new File(["not a PDF"], "sample.pdf", { type: "application/pdf" });
    await expect(validateDocument(file)).rejects.toMatchObject({ code: "unreadable_file" } satisfies Partial<DocumentValidationError>);
  });

  it("rejects oversized files before parsing", async () => {
    const bytes = new Uint8Array(MAX_FILE_BYTES + 1);
    const file = new File([bytes.buffer as ArrayBuffer], "large.pdf", { type: "application/pdf" });
    await expect(validateDocument(file)).rejects.toMatchObject({ code: "file_too_large" } satisfies Partial<DocumentValidationError>);
  });

  it("rejects PDFs above the page limit", async () => {
    const file = new File([await pdfBytes(26)], "too-many.pdf", { type: "application/pdf" });
    await expect(validateDocument(file)).rejects.toMatchObject({ code: "too_many_pages" } satisfies Partial<DocumentValidationError>);
  });
});
