import assert from "node:assert";

export type AST = string | AST[];

const whitespace = /^\s$/;
const identifier = /^[a-zA-Z0-9-+/*"]$/;

export class Parser {
  offset = 0;
  constructor(readonly data: string) {}

  /** top-level array is not an explicit list */
  public parse(): AST[] {
    this.skip(whitespace);

    const ast: AST[] = [];
    while (this.offset < this.data.length) {
      ast.push(this.parseExpression());
      this.skip(whitespace);
    }

    return ast;
  }

  peek() {
    return this.data.charAt(this.offset);
  }

  skip(pattern: RegExp) {
    while (pattern.test(this.peek())) {
      this.offset += 1;
    }
  }

  expect(char: string) {
    assert(char === this.peek(), "syntax error");
    this.offset += 1;
  }

  parseSymbol(): string {
    const start = this.offset;
    this.skip(identifier);
    assert(this.offset > start, "syntax error - expected symbol");
    return this.data.slice(start, this.offset);
  }

  parseList(): AST[] {
    this.expect("(");
    this.skip(whitespace);

    const list: AST[] = [];
    while (this.peek() !== ")") {
      list.push(this.parseExpression());
      this.skip(whitespace);
    }

    this.expect(")");
    return list;
  }

  parseExpression(): AST {
    const char = this.peek();
    if (char === "(") {
      return this.parseList();
    } else {
      return this.parseSymbol();
    }
  }
}
