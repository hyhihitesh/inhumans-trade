import { promises as fs } from "node:fs";
import path from "node:path";

export interface PrototypeEntry {
  slug: string;
  title: string;
  hasScreenshot: boolean;
}

const PROTOTYPE_ROOT = path.join(
  process.cwd(),
  "src",
  "stitch_settings_broker_connect",
  "stitch_settings_broker_connect"
);

function toTitle(slug: string): string {
  return slug
    .replace(/[_-]+/g, " ")
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isSafeSlug(slug: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(slug);
}

export async function listPrototypeEntries(): Promise<PrototypeEntry[]> {
  const dirents = await fs.readdir(PROTOTYPE_ROOT, { withFileTypes: true });

  const entries = await Promise.all(
    dirents
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const slug = entry.name;
        const codePath = path.join(PROTOTYPE_ROOT, slug, "code.html");
        const screenshotPath = path.join(PROTOTYPE_ROOT, slug, "screen.png");

        try {
          await fs.access(codePath);
        } catch {
          return null;
        }

        let hasScreenshot = true;
        try {
          await fs.access(screenshotPath);
        } catch {
          hasScreenshot = false;
        }

        return {
          slug,
          title: toTitle(slug),
          hasScreenshot,
        } satisfies PrototypeEntry;
      })
  );

  return entries.filter((entry): entry is PrototypeEntry => entry !== null);
}

export function getPrototypeFilePath(slug: string, filename: "code.html" | "screen.png"): string {
  if (!isSafeSlug(slug)) {
    throw new Error("Invalid prototype slug.");
  }

  return path.join(PROTOTYPE_ROOT, slug, filename);
}
