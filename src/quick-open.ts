import { createToolbarIcon } from "./icons.ts";

interface QuickOpenItem {
  kind: "directory" | "file";
  path: string;
}

export interface QuickOpenPanel {
  dialog: HTMLDialogElement;
  open: () => void;
  update: (favorites: QuickOpenItem[], recents: QuickOpenItem[]) => void;
}

export function createQuickOpen(
  onSelect: (item: QuickOpenItem) => void,
  onClose: () => void,
): QuickOpenPanel {
  const dialog = document.createElement("dialog");
  dialog.id = "linguamark-markdown-library";
  dialog.className = "linguamark-markdown-library";
  dialog.dataset.linguamarkUi = "";
  dialog.setAttribute("aria-label", "快捷打开收藏与最近项目");

  const panel = document.createElement("div");
  panel.className = "linguamark-markdown-library-panel";
  const header = document.createElement("div");
  header.className = "linguamark-quick-open-header";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "linguamark-quick-open-input";
  input.placeholder = "搜索收藏与最近打开…";
  input.autofocus = true;
  input.autocomplete = "off";
  input.spellcheck = false;
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-label", "按文件名或路径搜索收藏与最近打开");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "true");
  input.setAttribute("aria-controls", "linguamark-quick-open-results");
  input.setAttribute("aria-describedby", "linguamark-quick-open-hints");
  const close = document.createElement("button");
  close.type = "button";
  close.className = "linguamark-quick-open-close";
  close.textContent = "Esc";
  close.setAttribute("aria-label", "关闭快捷打开");
  close.addEventListener("click", () => dialog.close());
  header.append(input, close);

  const results = document.createElement("div");
  results.id = "linguamark-quick-open-results";
  results.className = "linguamark-quick-open-results";
  results.setAttribute("role", "listbox");
  results.setAttribute("aria-label", "收藏与最近打开");
  const empty = document.createElement("p");
  empty.className = "linguamark-quick-open-empty";
  const footer = document.createElement("div");
  footer.className = "linguamark-quick-open-footer";
  const status = document.createElement("span");
  status.setAttribute("role", "status");
  const hints = document.createElement("span");
  hints.id = "linguamark-quick-open-hints";
  hints.textContent = "↑↓ 选择 · Enter 打开";
  footer.append(status, hints);
  panel.append(header, results, empty, footer);
  dialog.append(panel);

  let favorites: QuickOpenItem[] = [];
  let recents: QuickOpenItem[] = [];
  let visibleItems: QuickOpenItem[] = [];
  let options: HTMLElement[] = [];
  let selectedIndex = -1;
  const key = (item: QuickOpenItem): string => `${item.kind}:${item.path}`;

  const select = (index: number, scroll = false): void => {
    selectedIndex = index;
    options.forEach((option, optionIndex) => {
      option.setAttribute("aria-selected", String(optionIndex === index));
    });
    const active = options[index];
    if (active) {
      input.setAttribute("aria-activedescendant", active.id);
      if (scroll) active.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  };

  const render = (): void => {
    const selectedKey = visibleItems[selectedIndex] ? key(visibleItems[selectedIndex]!) : undefined;
    const query = input.value.trim().toLocaleLowerCase();
    const terms = query.split(/\s+/u).filter(Boolean);
    const favoriteKeys = new Set(favorites.map(key));
    const seen = new Set<string>();
    const unique = (items: QuickOpenItem[]): QuickOpenItem[] => items.filter((item) => {
      const itemKey = key(item);
      if (seen.has(itemKey)) return false;
      seen.add(itemKey);
      return true;
    });
    const groups = query
      ? [{ title: "搜索结果", items: unique([...favorites, ...recents]).filter((item) => {
        const path = item.path.replaceAll("\\", "/").toLocaleLowerCase();
        return terms.every((term) => path.includes(term.replaceAll("\\", "/")));
      }) }]
      : [{ title: "收藏", items: unique(favorites) }, { title: "最近打开", items: unique(recents) }];
    visibleItems = [];
    options = [];
    results.replaceChildren();
    for (const group of groups) {
      if (!group.items.length) continue;
      const section = document.createElement("div");
      section.setAttribute("role", "group");
      section.setAttribute("aria-label", group.title);
      const heading = document.createElement("div");
      heading.className = "linguamark-quick-open-heading";
      heading.setAttribute("aria-hidden", "true");
      heading.textContent = group.title;
      section.append(heading);
      for (const item of group.items) {
        const index = visibleItems.length;
        visibleItems.push(item);
        const option = document.createElement("div");
        option.id = `linguamark-quick-open-option-${index}`;
        option.className = "linguamark-quick-open-option";
        option.setAttribute("role", "option");
        option.title = item.path;
        const normalized = item.path.replaceAll("\\", "/").replace(/\/+$/u, "");
        const slash = normalized.lastIndexOf("/");
        const name = normalized.slice(slash + 1) || item.path;
        const parent = normalized.slice(0, slash) || "/";
        const saved = favoriteKeys.has(key(item));
        const kind = item.kind === "directory" ? "目录" : "文件";
        option.setAttribute("aria-label", `${name}，${kind}${saved ? "，已收藏" : ""}，${item.path}`);
        const icon = createToolbarIcon(item.kind === "directory" ? "folder" : "list");
        const text = document.createElement("div");
        text.className = "linguamark-quick-open-text";
        const label = document.createElement("div");
        label.className = "linguamark-quick-open-name";
        label.textContent = name;
        const path = document.createElement("div");
        path.className = "linguamark-quick-open-path";
        path.textContent = parent;
        text.append(label, path);
        option.append(icon, text);
        if (saved) {
          const star = createToolbarIcon("star");
          star.classList.add("linguamark-quick-open-star");
          option.append(star);
        }
        option.addEventListener("pointermove", () => select(index));
        option.addEventListener("mousedown", (event) => event.preventDefault());
        option.addEventListener("click", () => onSelect(item));
        options.push(option);
        section.append(option);
      }
      results.append(section);
    }
    empty.hidden = visibleItems.length > 0;
    empty.textContent = query ? "没有匹配的收藏或最近项目" : "暂无收藏或最近项目，先打开一份文档吧";
    status.textContent = `${visibleItems.length} 个项目`;
    const previousIndex = visibleItems.findIndex((item) => key(item) === selectedKey);
    select(visibleItems.length ? Math.max(0, previousIndex) : -1);
  };

  input.addEventListener("input", () => {
    selectedIndex = -1;
    render();
    results.scrollTop = 0;
  });
  input.addEventListener("keydown", (event) => {
    if (event.isComposing || event.keyCode === 229) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (visibleItems.length) {
        const step = event.key === "ArrowDown" ? 1 : -1;
        select((selectedIndex + step + visibleItems.length) % visibleItems.length, true);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = visibleItems[selectedIndex];
      if (item && !event.repeat) onSelect(item);
    }
  });
  dialog.addEventListener("keydown", (event) => {
    // Keep Escape and reading shortcuts inside the modal, including during IME composition.
    event.stopPropagation();
  });
  dialog.addEventListener("close", () => {
    if (!dialog.open) onClose();
  });

  return {
    dialog,
    open() {
      if (dialog.open) return;
      input.value = "";
      selectedIndex = -1;
      render();
      dialog.showModal();
      input.focus({ preventScroll: true });
      results.scrollTop = 0;
    },
    update(nextFavorites, nextRecents) {
      favorites = nextFavorites;
      recents = nextRecents;
      render();
    },
  };
}
