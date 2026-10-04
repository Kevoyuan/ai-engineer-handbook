import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = fileURLToPath(new URL("../../../web/site/", import.meta.url));
execFileSync("npx", ["vite", "build"], { cwd: root, stdio: "inherit" });
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(new URL("../dist/", import.meta.url), output, { recursive: true });
execFileSync("node", [fileURLToPath(new URL("../../../web/sync-diagram-csp.mjs", import.meta.url))], { stdio: "inherit" });
console.log("Published the handbook build to web/site.");
