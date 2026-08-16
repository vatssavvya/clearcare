import { PDFDocument } from "pdf-lib";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_PDF_PAGES = 25;

export type ValidatedDocument = {
  bytes: Uint8Array;
  mimeType: "application/pdf" | "image/png" | "image/jpeg";
  safeFilename: string;
  pageCount: number;
  extension: "pdf" | "png" | "jpg" | "jpeg";
};

export class DocumentValidationError extends Error {
  constructor(public readonly code: "unsupported_file" | "mime_mismatch" | "file_too_large" | "too_many_pages" | "unreadable_file") {
    super(code);
    this.name = "DocumentValidationError";
  }
}

function hasPrefix(bytes: Uint8Array, prefix: number[]) {
  return prefix.every((value, index) => bytes[index] === value);
}

function signatureMime(bytes: Uint8Array) {
  if (hasPrefix(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf" as const;
  if (hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png" as const;
  if (hasPrefix(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg" as const;
  return null;
}

export async function validateDocument(file: File): Promise<ValidatedDocument> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "pdf" && extension !== "png" && extension !== "jpg" && extension !== "jpeg") {
    throw new DocumentValidationError("unsupported_file");
  }
  if (file.size <= 0) throw new DocumentValidationError("unreadable_file");
  if (file.size > MAX_FILE_BYTES) throw new DocumentValidationError("file_too_large");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detectedMime = signatureMime(bytes);
  if (!detectedMime) throw new DocumentValidationError("unreadable_file");
  const expectedMime = extension === "pdf" ? "application/pdf" : extension === "png" ? "image/png" : "image/jpeg";
  if (detectedMime !== expectedMime || (file.type && file.type !== expectedMime)) {
    throw new DocumentValidationError("mime_mismatch");
  }

  let pageCount = 1;
  if (detectedMime === "application/pdf") {
    try {
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: false, updateMetadata: false });
      pageCount = pdf.getPageCount();
    } catch {
      throw new DocumentValidationError("unreadable_file");
    }
    if (pageCount <= 0) throw new DocumentValidationError("unreadable_file");
    if (pageCount > MAX_PDF_PAGES) throw new DocumentValidationError("too_many_pages");
  }

  return {
    bytes,
    mimeType: detectedMime,
    safeFilename: `clearcare-document.${extension === "jpeg" ? "jpg" : extension}`,
    pageCount,
    extension,
  };
}
