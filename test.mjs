// TDD-lite test for the Five Seconds to Explain the Glass entry.
// Run: node test.mjs
// Checks the kit gate + brief requirements against the finished main.ts.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(fileURLToPath(import.meta.url));
const mainTs = join(repoDir, "main.ts");

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
}

function runMain(outDir) {
  execFileSync(process.execPath, [mainTs], {
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: outDir },
    stdio: "pipe",
  });
  return readFileSync(join(outDir, "entry.txt"), "utf8");
}

// 1. main.ts exists and runs (stdlib-only: no imports outside node: builtins —
//    checked by reading the source for import statements).
const src = readFileSync(mainTs, "utf8");
const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
check(
  "stdlib-only imports",
  imports.every((i) => i.startsWith("node:")),
  imports.join(", ") || "(no imports)"
);

// 2. Gate: entry.txt is UTF-8 text, 1–200 characters, not only whitespace.
const out1 = mkdtempSync(join(tmpdir(), "glass-out-"));
const text = runMain(out1);
const chars = [...text].length;
check("entry length 1–200 chars", chars >= 1 && chars <= 200, `${chars} chars`);
check("entry not only whitespace", text.trim().length > 0);
check("entry is a single sentence", (text.match(/[.!?]/g) || []).length === 1, "one terminal mark");
check("entry has no newline", !text.includes("\n"));

// 3. Determinism: two runs produce byte-identical output.
const out2 = mkdtempSync(join(tmpdir(), "glass-out-"));
const text2 = runMain(out2);
check("deterministic output", text === text2);

// 4. Brief: cat's own voice — no apology, no confession.
check("no apology", !/\b(sorry|apolog|my fault|my bad|forgive)\b/i.test(text));
check("mentions the glass", /\bglass\b/i.test(text));

// 5. Fresh idea: none of the banned obvious lines.
check(
  "no banned obvious excuse",
  !/gravity|slippery|already falling|was going to fall/i.test(text)
);

rmSync(out1, { recursive: true, force: true });
rmSync(out2, { recursive: true, force: true });

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
