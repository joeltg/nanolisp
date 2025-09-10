import assert from "node:assert";
import fs from "node:fs";

import { Parser } from "./Parser.js";

const path = process.argv[2];
assert(path !== undefined, "missing [path] CLI argument");

const data = fs.readFileSync(path, "utf-8");

const parser = new Parser(data);
for (const expr of parser.parse()) {
  console.log(expr);
}
