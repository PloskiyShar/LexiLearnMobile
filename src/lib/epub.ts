// src/lib/epub.ts
import JSZip from "jszip";
import { toByteArray } from "base64-js";

export async function parseEpubFromBase64(base64: string): Promise<string> {
  if (typeof base64 !== "string" || !base64) return "";
  try {
    const binary = toByteArray(base64); // Uint8Array
    const zip = await JSZip.loadAsync(binary);

    const parts: string[] = [];
    const fileNames = Object.keys(zip.files);

    for (const name of fileNames) {
      if (name.endsWith(".xhtml") || name.endsWith(".html")) {
        const file = zip.files[name];
        if (!file) continue;
        const html = await file.async("string");
        const plain = html
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (plain) parts.push(plain);
      }
    }
    return parts.join("\n\n");
  } catch (e) {
    console.error("EPUB parse failed", e);
    return "";
  }
}
