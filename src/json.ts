// Keep source tokens rather than reserializing parsed values: numbers and duplicate keys stay intact.
const JSON_TOKEN = /"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],:]/gu;

export function createJsonArticle(source: string): HTMLElement {
  const article = document.createElement("article");
  article.id = "write";
  article.className = "linguamark-json";
  article.dataset.linguamarkIgnore = "";
  const text = source.replace(/^\uFEFF/u, "");
  try {
    JSON.parse(text);
  } catch {
    const message = document.createElement("p");
    message.className = "linguamark-json-error";
    message.role = "status";
    message.textContent = "JSON 格式无效，以下显示原始内容。";
    const raw = document.createElement("pre");
    raw.textContent = source;
    article.append(message, raw);
    return article;
  }

  const tokens = Array.from(text.matchAll(JSON_TOKEN), (match) => match[0]);
  const pendingChildren = new Set<() => void>();
  article.addEventListener("linguamark:prepare-search", () => {
    // Set iteration also visits newly registered descendants, without recursive expansion.
    for (const populate of pendingChildren) populate();
    pendingChildren.clear();
  });
  const ends = new Map<number, number>();
  const stack: number[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index] === "{" || tokens[index] === "[") stack.push(index);
    else if (tokens[index] === "}" || tokens[index] === "]") ends.set(stack.pop()!, index);
  }

  const tokenSpan = (token: string, key = false): HTMLSpanElement => {
    const span = document.createElement("span");
    span.className = key ? "json-key" : token.startsWith('"') ? "json-string"
      : /^(true|false|null)$/u.test(token) ? "json-literal" : "json-number";
    span.textContent = token;
    return span;
  };

  const appendValue = (parent: HTMLElement, start: number, depth: number, key?: string): number => {
    const end = ends.get(start);
    const comma = tokens[(end ?? start) + 1] === "," ? "," : "";
    const prefix = (): Node[] => key === undefined ? [] : [tokenSpan(key, true), document.createTextNode(": ")];
    if (end === undefined || end === start + 1) {
      const row = document.createElement("div");
      row.className = "json-row";
      row.append(...prefix());
      if (end === undefined) row.append(tokenSpan(tokens[start]));
      else row.append(tokens[start] + tokens[end]);
      row.append(comma);
      parent.append(row);
      return (end ?? start) + 1;
    }

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.append(...prefix(), tokens[start]);
    const preview = document.createElement("span");
    preview.className = "json-collapsed";
    preview.textContent = ` … ${tokens[end]}${comma}`;
    summary.append(preview);
    const children = document.createElement("div");
    children.className = "json-children";
    const closing = document.createElement("div");
    closing.className = "json-row";
    closing.textContent = tokens[end] + comma;
    details.append(summary, children, closing);
    let populated = false;
    const populate = (): void => {
      if (populated) return;
      populated = true;
      for (let index = start + 1; index < end;) {
        if (tokens[index] === ",") { index += 1; continue; }
        const isKey = tokens[index + 1] === ":";
        index = appendValue(children, isKey ? index + 2 : index, depth + 1, isKey ? tokens[index] : undefined);
      }
    };
    pendingChildren.add(populate);
    details.addEventListener("toggle", () => {
      if (details.open) populate();
    });
    // Lazy child creation bounds initial work for deeply nested documents.
    details.open = depth < 2;
    if (details.open) populate();
    parent.append(details);
    return end + 1;
  };
  const tree = document.createElement("div");
  tree.className = "json-tree";
  tree.setAttribute("aria-label", "JSON 内容");
  appendValue(tree, 0, 0);
  article.append(tree);
  return article;
}
