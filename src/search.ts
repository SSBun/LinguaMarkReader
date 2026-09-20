interface TextSegment {
  node: Text;
  start: number;
  end: number;
}

const TEXT_BLOCK = "p, div, li, pre, h1, h2, h3, h4, h5, h6, summary, td, th, dt, dd, blockquote";
const EXCLUDED_TEXT = "script, style, svg, math, .katex-mathml, .json-collapsed, [hidden], [aria-hidden='true'], button, input, textarea, select";

export function initializeDocumentSearch(content: HTMLElement, shell: HTMLElement, canOpen: () => boolean): void {
  const panel = document.createElement("div");
  panel.className = "linguamark-document-search";
  panel.setAttribute("role", "search");
  panel.setAttribute("aria-label", "搜索当前文档");
  panel.hidden = true;
  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "搜索当前文档";
  input.setAttribute("aria-label", "搜索当前文档");
  input.autocomplete = "off";
  input.spellcheck = false;
  const count = document.createElement("output");
  count.setAttribute("aria-live", "polite");
  const button = (label: string, text: string): HTMLButtonElement => {
    const element = document.createElement("button");
    element.type = "button";
    element.className = "linguamark-markdown-directory-button";
    element.setAttribute("aria-label", label);
    element.title = label;
    element.textContent = text;
    return element;
  };
  const previous = button("上一个匹配（Shift+Enter）", "↑");
  const next = button("下一个匹配（Enter）", "↓");
  const dismiss = button("关闭搜索（Esc）", "×");
  panel.append(input, count, previous, next, dismiss);
  shell.append(panel);

  let article: HTMLElement | null = null;
  let matches: HTMLElement[][] = [];
  let active = -1;
  let timer: number | undefined;
  let composing = false;
  let previousFocus: HTMLElement | null = null;
  const openedDetails = new Set<HTMLDetailsElement>();

  const clearMarks = (): void => {
    // Document HTML may carry the same data attribute; only unwrap nodes we created.
    for (const group of matches) {
      for (const mark of group) mark.replaceWith(document.createTextNode(mark.textContent ?? ""));
    }
    article?.normalize();
    matches = [];
    active = -1;
  };
  const updateCount = (): void => {
    count.textContent = !input.value ? "输入关键词" : matches.length ? `${active + 1} / ${matches.length}` : "无匹配";
    previous.disabled = next.disabled = matches.length === 0;
  };
  const selectMatch = (index: number): void => {
    for (const mark of matches[active] ?? []) mark.classList.remove("is-current");
    active = matches.length ? (index + matches.length) % matches.length : -1;
    for (const mark of matches[active] ?? []) {
      mark.classList.add("is-current");
      for (let details = mark.closest("details"); details; details = details.parentElement?.closest("details") ?? null) {
        if (!details.open) {
          openedDetails.add(details);
          details.open = true;
        }
      }
    }
    matches[active]?.[0]?.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
    updateCount();
  };
  const observe = (): void => observer.observe(content, { childList: true, characterData: true, subtree: true });
  const search = (): void => {
    clearTimeout(timer);
    timer = undefined;
    observer.disconnect();
    clearMarks();
    if (article && input.value) {
      article.dispatchEvent(new Event("linguamark:prepare-search"));
      const segments: TextSegment[] = [];
      const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      let text = "";
      let block: Element | null = null;
      for (let candidate = walker.nextNode(); candidate; candidate = walker.nextNode()) {
        if (candidate instanceof HTMLBRElement) text += "\n";
        if (!(candidate instanceof Text)) continue;
        const node = candidate;
        const parent = node.parentElement;
        if (!parent || parent.closest(EXCLUDED_TEXT) || !node.data) continue;
        const nextBlock = parent.closest(TEXT_BLOCK);
        if (text && nextBlock !== block) text += "\n";
        block = nextBlock;
        const start = text.length;
        text += node.data;
        segments.push({ node, start, end: text.length });
      }
      // Use regex indices in the original text: lowercasing can change Unicode string length.
      const pattern = new RegExp(input.value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "giu");
      const hits = Array.from(text.matchAll(pattern), (match) => ({ start: match.index, end: match.index + match[0].length }));
      matches = hits.map(() => []);
      let firstHit = 0;
      for (const segment of segments) {
        while (firstHit < hits.length && hits[firstHit].end <= segment.start) firstHit += 1;
        if (firstHit === hits.length || hits[firstHit].start >= segment.end) continue;
        const fragment = document.createDocumentFragment();
        let offset = 0;
        for (let index = firstHit; index < hits.length && hits[index].start < segment.end; index += 1) {
          const start = Math.max(0, hits[index].start - segment.start);
          const end = Math.min(segment.node.length, hits[index].end - segment.start);
          fragment.append(segment.node.data.slice(offset, start));
          const mark = document.createElement("mark");
          mark.dataset.documentSearch = "";
          mark.textContent = segment.node.data.slice(start, end);
          fragment.append(mark);
          matches[index].push(mark);
          offset = end;
        }
        fragment.append(segment.node.data.slice(offset));
        segment.node.replaceWith(fragment);
      }
    }
    selectMatch(0);
    observe();
  };
  const close = (restoreFocus = true): void => {
    clearTimeout(timer);
    observer.disconnect();
    clearMarks();
    for (const details of openedDetails) details.open = false;
    openedDetails.clear();
    panel.hidden = true;
    if (restoreFocus) (previousFocus?.isConnected ? previousFocus : content).focus({ preventScroll: true });
    article = null;
  };
  const observer = new MutationObserver(() => {
    if (content.querySelector("#write") !== article) {
      close(false);
      return;
    }
    clearTimeout(timer);
    timer = window.setTimeout(search, 120);
  });

  input.addEventListener("compositionstart", () => { composing = true; clearTimeout(timer); });
  input.addEventListener("compositionend", () => { composing = false; search(); });
  input.addEventListener("input", () => {
    clearTimeout(timer);
    if (!composing) timer = window.setTimeout(search, 120);
  });
  const navigate = (direction: number): void => {
    if (timer !== undefined) {
      search();
      if (direction < 0) selectMatch(matches.length - 1);
    } else selectMatch(active + direction);
  };
  previous.addEventListener("click", () => navigate(-1));
  next.addEventListener("click", () => navigate(1));
  dismiss.addEventListener("click", () => close());
  panel.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing || composing || event.target !== input) return;
    event.preventDefault();
    navigate(event.shiftKey ? -1 : 1);
  });
  addEventListener("keydown", (event) => {
    if (document.querySelector("body > dialog[open]") || !canOpen()) return;
    if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      event.stopImmediatePropagation();
      const current = content.querySelector<HTMLElement>("#write");
      if (!current || current.matches(".linguamark-empty-viewer, .linguamark-directory-image-preview")) return;
      if (panel.hidden) {
        article = current;
        previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        panel.hidden = false;
        search();
      }
      input.focus();
      input.select();
    } else if (event.key === "Escape" && !event.isComposing && !composing && !panel.hidden) {
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    }
  }, { capture: true });
  updateCount();
}
