// usage: node run.js <design> [out.board.json]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
const outFile = process.argv[3] ?? path.join(here, "out", `${name}.board.json`);

const { default: board } = await import(
  path.join(here, "designs", `${name}.js`)
);

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(board));

console.log(
  `${board.regions.length} regions, ${board.traces.length} traces, ${board.drills.length} drills -> ${path.relative(here, outFile)}`,
);
