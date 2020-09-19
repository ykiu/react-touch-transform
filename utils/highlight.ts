import styles from "./highlight.module.css";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ts = require("typescript");

function toHtml(sourceFile, node = sourceFile) {
  const children = node.getChildren();
  const className =
    styles[ts.SyntaxKind[node.kind]] || ts.SyntaxKind[node.kind];
  if (children.length) {
    return `<span class="${className}">${children
      .map((c) => toHtml(sourceFile, c))
      .join("")}</span>`;
  } else {
    return `<span class="${className}">${node
      .getFullText(sourceFile)
      .replace(/[<>]/g, (match) => {
        switch (match) {
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          default:
            return match;
        }
      })}</span>`;
  }
}

export default function highlight(code: string): string {
  const sourceFile = ts.createSourceFile(
    "foo.ts",
    code,
    ts.ScriptTarget.ES5,
    true,
    ts.ScriptKind.TSX
  );
  return toHtml(sourceFile);
}
