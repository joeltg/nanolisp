export type AST = string | number | AST[];

const whitespace = /^\s$/;
const identifier = /^[a-zA-Z-+/*"]$/;
const digit = /^\d$/;
const comment = /^[^\n]$/;

export class Parser {
  private offset = 0;

  public constructor(private readonly data: string) {}

  public *parse(): Iterable<AST> {
    this.skip(whitespace);
    this.skipComments();

    while (this.offset < this.data.length) {
      yield this.parseExpression();
      this.skip(whitespace);
      this.skipComments();
    }
  }

  private assert(condition: unknown, message: string) {
    if (!condition) {
      const margin = 20;
      const start = Math.max(this.offset - margin, 0);
      const end = Math.min(this.offset + margin, this.data.length);
      const ctx = JSON.stringify(this.data.slice(start, end));
      throw new SyntaxError(`${message} - near "${ctx}"`);
    }
  }

  private peek() {
    return this.data.charAt(this.offset);
  }

  private skip(pattern: RegExp) {
    while (pattern.test(this.peek())) {
      this.offset += 1;
    }
  }

  private skipComments() {
    while (this.peek() === ";") {
      this.skip(comment);
      this.skip(whitespace);
    }
  }

  private expect(char: string) {
    this.assert(char === this.peek(), `expected '${char}'`);
    this.offset += 1;
  }

  private parseSymbol(): string {
    const start = this.offset;
    this.skip(identifier);
    this.assert(this.offset > start, "syntax error - expected a symbol");
    return this.data.slice(start, this.offset);
  }

  private parseInteger(): number {
    const start = this.offset;
    this.skip(digit);
    this.assert(this.offset > start, "syntax error - expected an integer");
    return parseInt(this.data.slice(start, this.offset));
  }

  private parseList(): AST[] {
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

  private parseExpression(): AST {
    const char = this.peek();
    if (char === "(") {
      return this.parseList();
    } else if (digit.test(char)) {
      return this.parseInteger();
    } else if (identifier.test(char)) {
      return this.parseSymbol();
    } else {
      throw new SyntaxError("invalid symbol");
    }
  }
}
