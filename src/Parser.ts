import assert from "node:assert";

export type AST = string | AST[];

const whitespace = /^\s$/;
const identifier = /^[a-zA-Z0-9-+/*"]$/;
const comment = /^[^\n]$/;

export class Parser {
  offset = 0;
  constructor(readonly data: string) {}

  public *parse(): Iterable<AST> {
    this.skip(whitespace);
    this.skipComments();

    while (this.offset < this.data.length) {
      yield this.parseExpression();
      this.skip(whitespace);
      this.skipComments();
    }
  }

  peek() {
    return this.data.charAt(this.offset);
  }

  skip(pattern: RegExp) {
    while (pattern.test(this.peek())) {
      this.offset += 1;
    }
  }

  skipComments() {
    while (this.peek() === ";") {
      this.skip(comment);
      this.skip(whitespace);
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
      this.skipComments();
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
