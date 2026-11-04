import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const testsDir = path.join(rootDir, "tests");
const specFiles = fs
  .readdirSync(testsDir)
  .filter((file) => file.endsWith(".spec.ts"))
  .sort()
  .map((file) => path.join("tests", file));

const specRun = spawnSync(
  process.execPath,
  ["--import", "./scripts/ts-loader.mjs", "--test", ...specFiles],
  { stdio: "inherit", cwd: rootDir },
);

if (specRun.status !== 0) {
  process.exit(specRun.status ?? 1);
}

const propertyRun = spawnSync(
  process.execPath,
  ["scripts/test-learning.mjs"],
  { stdio: "inherit", cwd: rootDir },
);

process.exit(propertyRun.status ?? 1);
