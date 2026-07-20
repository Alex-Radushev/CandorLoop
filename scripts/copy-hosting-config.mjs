import { copyFileSync, existsSync, mkdirSync } from "node:fs";

const source = new URL("../.openai/hosting.json", import.meta.url);
const buildEntry = new URL("../dist/server/index.js", import.meta.url);
const targetDirectory = new URL("../dist/.openai/", import.meta.url);
const target = new URL("../dist/.openai/hosting.json", import.meta.url);

if (!existsSync(source)) {
  throw new Error("Missing .openai/hosting.json.");
}

if (!existsSync(buildEntry)) {
  throw new Error("Missing Vinext build output at dist/server/index.js.");
}

mkdirSync(targetDirectory, { recursive: true });
copyFileSync(source, target);

console.log("Included the Sites project manifest in the production build.");
