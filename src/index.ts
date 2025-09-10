import assert from "node:assert";
import fs from "node:fs";

import { Parser } from "./Parser.js";

const path = process.argv[2];
assert(path !== undefined, "missing [path] CLI argument");

const data = fs.readFileSync(path, "utf-8");

const ast = new Parser(data).parse();
for (const expr of ast) {
  console.log(expr);
}
