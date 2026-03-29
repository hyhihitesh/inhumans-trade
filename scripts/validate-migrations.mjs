import { readdir } from "node:fs/promises";
import path from "node:path";

const migrationsDir = path.resolve("supabase", "migrations");
const filenamePattern = /^(\d{14})_[a-z0-9_]+\.sql$/;

function fail(message) {
  console.error(`Migration validation failed: ${message}`);
  process.exit(1);
}

async function main() {
  let entries;
  try {
    entries = await readdir(migrationsDir, { withFileTypes: true });
  } catch (error) {
    fail(`unable to read ${migrationsDir}: ${(error && error.message) || String(error)}`);
    return;
  }

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();

  if (files.length === 0) {
    fail("no SQL migration files found.");
  }

  const seenTimestamps = new Set();
  const invalidFiles = [];

  for (const file of files) {
    const match = filenamePattern.exec(file);
    if (!match) {
      invalidFiles.push(file);
      continue;
    }
    const timestamp = match[1];
    if (seenTimestamps.has(timestamp)) {
      fail(`duplicate migration timestamp detected: ${timestamp} (${file})`);
    }
    seenTimestamps.add(timestamp);
  }

  if (invalidFiles.length > 0) {
    fail(
      `invalid migration filename(s): ${invalidFiles.join(
        ", "
      )}. Expected pattern: YYYYMMDDHHMMSS_description.sql`
    );
  }

  console.log(`Migration validation passed (${files.length} files).`);
}

main();
