// Five Seconds to Explain the Glass
// Writes the one sentence a house cat would say in its own defence after
// knocking a glass off the table — no apology, no confession, just the most
// convincing case a cat can make for itself. Stdlib-only, deterministic.
//
// Gate the sentence must satisfy: one sentence, 1–200 characters, UTF-8,
// spoken in about five seconds. The guard below fails loudly if a future
// edit ever breaks that, instead of writing an entry the judge would score 0.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Resolved from the script's own location, never process.cwd(), so the
// entry builds identically no matter where the kit runner invokes it.
const repoDir = dirname(fileURLToPath(import.meta.url));
void repoDir;

const ENTRY =
  "It had been squatting on my sunbeam since Tuesday, so I served the glass an eviction notice — one paw, no warning, no appeal.";

if (
  [...ENTRY].length < 1 ||
  [...ENTRY].length > 200 ||
  (ENTRY.match(/[.!?]/g) || []).length !== 1 ||
  ENTRY.includes("\n")
) {
  throw new Error("Entry must be exactly one sentence of 1–200 characters.");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
