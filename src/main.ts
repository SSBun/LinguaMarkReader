import { listen } from "@tauri-apps/api/event";
import zenuml from "@mermaid-js/mermaid-zenuml";
import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";
import katex from "katex";
import MarkdownIt from "markdown-it";
import footnote from "markdown-it-footnote";
import taskLists from "markdown-it-task-lists";
import texmath from "markdown-it-texmath";
import mermaid from "mermaid";
import { logWarn } from "./debug.ts";
import { createToolbarIcon } from "./icons.ts";
import { createJsonArticle } from "./json.ts";
import { createPdfArticle } from "./pdf.ts";
import { initializeDocumentSearch } from "./search.ts";
import { applyTypography, createSettingsPage, getSettings, subscribeSettings, updateSettings } from "./settings.ts";
import {
  directoryFileKind, pickEntry, pickDirectory, readFile, readDirectory, takeOpenedFile,
  readLibrary, writeLibrary, openExternal, errorMessage,
  type DirectoryBrowserState, type DirectoryFileContent,
  type DirectoryFileKind, type DirectoryTreeEntry,
} from "./platform.ts";

const VIEWER_FAVORITES_KEY = "markdownViewerFavorites";
const VIEWER_RECENTS_KEY = "markdownViewerRecents";
const VIEWER_SESSION_KEY = "markdownViewerSession";
const MAX_VIEWER_RECENTS = 5;
const HAN_CHARACTER_PATTERN = /\p{Script=Han}/gu;
const ENGLISH_WORD_PATTERN = /\p{Script=Latin}+(?:['’-]\p{Script=Latin}+)*/gu;
const ALERT_LABELS = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
} as const;

type ViewerItemKind = "directory" | "file";
type SidebarView = "files" | "outline";

interface ViewerItem {
  kind: ViewerItemKind;
  path: string;
}

interface ViewerLibraryElements {
  dialog: HTMLDialogElement;
  favoriteList: HTMLUListElement;
  recentList: HTMLUListElement;
}

interface ViewerElements {
  toolbar: HTMLElement;
  shell: HTMLElement;
  content: HTMLElement;
  fileName: HTMLElement;
  importButton: HTMLButtonElement;
  favoriteButton: HTMLButtonElement;
  favoriteIcon: HTMLElement;
  favoriteLabel: HTMLElement;
  libraryButton: HTMLButtonElement;
  libraryDialog: HTMLDialogElement;
  settingsDialog: HTMLDialogElement;
  openSettings: () => void;
  favoriteList: HTMLUListElement;
  recentList: HTMLUListElement;
  currentItem?: ViewerItem;
  directoryRootName?: string;
  setSidebar: (view: SidebarView, sidebar: HTMLElement | undefined, activate?: boolean) => void;
  openSidebar: () => void;
  setPath: (path: string) => void;
  setContentCount: (source: string) => void;
  setActiveFile: (path: string) => void;
}

interface ResolvedDirectoryReference {
  path: string;
  hash?: string;
}

let diagramRenderSequence = 0;
let directoryRenderSequence = 0;
let mermaidInitialization: Promise<void> | undefined;
let viewerFavorites: ViewerItem[] = [];
let viewerRecents: ViewerItem[] = [];
let viewerLibraryReady: Promise<void> | undefined;
let viewerLibraryLoaded = false;
let closeDirectoryContextMenu: ((restoreFocus?: boolean) => void) | undefined;
const directoryImageCache = new Map<string, string>();

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  highlight(source, language) {
    if (!language || !hljs.getLanguage(language)) return escapeHtml(source);
    return hljs.highlight(source, { language, ignoreIllegals: true }).value;
  },
})
  .use(footnote)
  .use(taskLists, { enabled: false })
  .use(texmath, {
    engine: katex,
    delimiters: ["dollars", "beg_end"],
    katexOptions: { throwOnError: false, strict: "ignore", trust: false },
  });

let navigationSequence = 0;
let pickerOpen = false;
let restoringSession = false;
let restoreScrollCancelled = false;
let documentRenderReady: Promise<void> = Promise.resolve();
let disposePdf: (() => void) | undefined;
renderStandaloneViewer();

function contentCount(source: string): number {
  return (source.match(HAN_CHARACTER_PATTERN)?.length ?? 0)
    + (source.match(ENGLISH_WORD_PATTERN)?.length ?? 0);
}

function renderStandaloneViewer(): void {
  try {
    const article = createEmptyViewerArticle();
    document.body.classList.add("linguamark-markdown-page", "linguamark-standalone-viewer");
    const viewer = createViewer(article);
    document.body.replaceChildren(viewer.toolbar, viewer.shell, viewer.libraryDialog, viewer.settingsDialog);
    document.documentElement.dataset.linguamarkMarkdown = "ready";
    document.title = "LinguaMark Reader";
    initializeNativeNavigation(viewer);
    initializeViewerLibrary(viewer);
    void initializeFileOpening(viewer);
  } catch (error: unknown) {
    showDirectoryNotice("阅读器初始化失败，请重启应用");
    document.documentElement.dataset.linguamarkMarkdown = "error";
    logWarn("content", "markdown.standalone.failed", { errorName: errorName(error) });
  }
}

async function initializeFileOpening(viewer: ViewerElements): Promise<void> {
  const initialNavigation = navigationSequence;
  let queue = Promise.resolve(false);
  const drain = (): Promise<boolean> => {
    queue = queue.then(async () => {
      const path = await takeOpenedFile();
      if (!path) return false;
      await openNativeFile(path, viewer);
      return true;
    }).catch((error: unknown) => {
      ++navigationSequence;
      showDirectoryNotice(errorMessage(error));
      // A failed explicit open must not be replaced by a restored document.
      return true;
    });
    return queue;
  };
  try {
    await listen("native-file-opened", () => { void drain(); });
    const opened = await drain();
    if (!opened && initialNavigation === navigationSequence && getSettings().restoreSession) {
      await restoreSession(viewer);
    }
  } catch (error: unknown) {
    showDirectoryNotice(`无法接收系统文件打开请求：${errorMessage(error)}`);
  }
}

function createEmptyViewerArticle(): HTMLElement {
  const article = document.createElement("article");
  article.id = "write";
  article.className = "linguamark-empty-viewer";
  article.dataset.linguamarkIgnore = "";
  const home = document.createElement("div");
  home.className = "linguamark-empty-viewer-home";
  const message = document.createElement("div");
  message.className = "linguamark-empty-viewer-message";
  const title = document.createElement("p");
  title.className = "linguamark-empty-viewer-title";
  title.textContent = "打开 Markdown、JSON、HTML 或 PDF 开始阅读";
  const description = document.createElement("p");
  description.textContent = "点击顶部“导入”，选择 Markdown、JSON、HTML、PDF 文件或阅读目录。";
  message.append(title, description);

  const library = document.createElement("div");
  library.className = "linguamark-markdown-library-grid linguamark-empty-viewer-library";
  const favorites = createViewerLibrarySection("全部收藏");
  favorites.list.dataset.viewerItems = "favorites";
  const recents = createViewerLibrarySection("最近浏览");
  recents.list.dataset.viewerItems = "recents";
  library.append(favorites.section, recents.section);
  home.append(message, library);
  article.append(home);
  return article;
}

function createArticle(source: string, kind: "markdown" | "html" = "markdown"): { article: HTMLElement; customCss: string } {
  const { body, frontMatter } = kind === "markdown" ? splitFrontMatter(source) : { body: source, frontMatter: undefined };
  const template = document.createElement("template");
  template.innerHTML = kind === "html" ? body
    : `${frontMatter ? `<pre class="md-meta-block">${escapeHtml(frontMatter)}</pre>` : ""}${markdown.render(body)}`;

  const customCss = [...template.content.querySelectorAll("style")]
    .map((style) => style.textContent ?? "")
    .map(scopeCustomCss)
    .filter(Boolean)
    .join("\n");
  for (const style of template.content.querySelectorAll("style")) style.remove();

  const purified = DOMPurify.sanitize(template.innerHTML, {
    RETURN_DOM_FRAGMENT: true,
    USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
    ADD_TAGS: ["eq", "eqn"],
    ADD_ATTR: ["sandbox", "loading", "referrerpolicy", "target", "rel"],
    FORBID_TAGS: ["script", "style", "object", "embed", "base", "meta", "link", "iframe", "audio", "video", "source"],
    FORBID_ATTR: ["srcdoc"],
  }) as DocumentFragment;
  const clean = purified.cloneNode(true) as DocumentFragment;

  const article = document.createElement("article");
  article.id = "write";
  article.append(clean);
  secureInteractiveContent(article);
  if (kind === "markdown") {
    for (const table of article.querySelectorAll("table")) {
      const container = document.createElement("div");
      container.className = "linguamark-table-scroll";
      container.tabIndex = 0;
      container.setAttribute("role", "region");
      container.setAttribute("aria-label", "表格（可横向滚动）");
      table.replaceWith(container);
      container.append(table);
    }
    decorateAlerts(article);
    decorateMath(article);
    prepareDiagrams(article);
  }
  return { article, customCss };
}

function splitFrontMatter(source: string): { body: string; frontMatter?: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
  if (!match) return { body: source };
  return { body: source.slice(match[0].length), frontMatter: match[1] };
}

function scopeCustomCss(source: string): string {
  if (!("CSSScopeRule" in window)) return "";
  const sheet = new CSSStyleSheet();
  try {
    sheet.replaceSync(source);
  } catch {
    return "";
  }

  const scopedRules: string[] = [];
  for (const rule of sheet.cssRules) {
    if (rule.type === CSSRule.IMPORT_RULE
      || rule.type === CSSRule.KEYFRAMES_RULE
      || rule.type === CSSRule.NAMESPACE_RULE) {
      continue;
    }
    if (rule.type === CSSRule.FONT_FACE_RULE) continue;
    else scopedRules.push(rule.cssText);
  }
  return [
    scopedRules.length > 0 ? `@scope (#write) {\n${scopedRules.join("\n")}\n}` : "",
  ].filter(Boolean).join("\n");
}

function replaceCustomStyle(css: string): void {
  for (const existing of document.querySelectorAll("style[data-linguamark-markdown-style]")) existing.remove();
  if (!css) return;
  const style = document.createElement("style");
  style.dataset.linguamarkMarkdownStyle = "";
  style.textContent = css;
  document.head.append(style);
}

function secureInteractiveContent(article: HTMLElement): void {
  for (const active of article.querySelectorAll("script, object, embed")) active.remove();
  for (const element of article.querySelectorAll("*")) {
    for (const attribute of [...element.attributes]) {
      if (attribute.name.toLowerCase().startsWith("on")
        || (isUrlAttribute(attribute.name) && isExecutableUrl(attribute.value))) {
        element.removeAttribute(attribute.name);
      }
    }
  }
  for (const iframe of article.querySelectorAll("iframe")) {
    iframe.setAttribute("sandbox", "");
    iframe.removeAttribute("allow");
    iframe.removeAttribute("srcdoc");
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer";
  }
  for (const form of article.querySelectorAll("form")) form.inert = true;
  for (const anchor of article.querySelectorAll<HTMLAnchorElement>("a[target='_blank']")) {
    anchor.rel = "noopener noreferrer";
  }
}

function isUrlAttribute(name: string): boolean {
  return ["href", "src", "action", "formaction", "poster", "xlink:href"].includes(name.toLowerCase());
}

function isExecutableUrl(value: string): boolean {
  return /^(?:javascript|vbscript):|^data:text\/html/iu.test(value.replaceAll(/[\u0000-\u0020]+/gu, ""));
}

function decorateAlerts(article: HTMLElement): void {
  for (const quote of article.querySelectorAll("blockquote")) {
    const firstParagraph = quote.querySelector(":scope > p:first-child");
    const firstText = firstParagraph ? document.createTreeWalker(firstParagraph, NodeFilter.SHOW_TEXT).nextNode() as Text | null : null;
    const match = firstText?.data.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/iu);
    if (!firstParagraph || !firstText || !match) continue;

    const kind = match[1].toLowerCase() as keyof typeof ALERT_LABELS;
    firstText.data = firstText.data.slice(match[0].length);
    quote.classList.add("md-alert", `md-alert-${kind}`);
    quote.role = "note";
    const heading = document.createElement("div");
    heading.className = "md-alert-text-container";
    const label = document.createElement("span");
    label.className = "md-alert-text";
    label.textContent = ALERT_LABELS[kind];
    heading.append(label);
    quote.prepend(heading);
    if (!firstParagraph.textContent?.trim()) firstParagraph.remove();
  }
}

function decorateMath(article: HTMLElement): void {
  for (const equation of article.querySelectorAll<HTMLElement>("eq")) {
    equation.classList.add("md-inline-math");
    equation.dataset.linguamarkIgnore = "";
  }
  for (const equation of article.querySelectorAll<HTMLElement>("eqn")) {
    const block = equation.closest<HTMLElement>("section") ?? equation;
    block.classList.add("md-math-block");
    block.dataset.linguamarkIgnore = "";
  }
}

function prepareDiagrams(article: HTMLElement): void {
  const blocks = [...article.querySelectorAll<HTMLElement>("pre > code.language-mermaid")];
  for (const code of blocks) {
    const pre = code.parentElement;
    if (!pre) continue;
    pre.classList.add("linguamark-mermaid-source");
    const panel = document.createElement("div");
    panel.className = "md-diagram-panel";
    panel.dataset.linguamarkIgnore = "";
    pre.replaceWith(panel);
    panel.append(pre);
  }
}

async function initializeMermaid(): Promise<void> {
  mermaidInitialization ??= (async () => {
    await mermaid.registerExternalDiagrams([zenuml]);
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: '"LXGW WenKai", "PingFang SC", system-ui, sans-serif',
      themeVariables: {
        background: "#faf7ef",
        primaryColor: "#faf7ef",
        primaryTextColor: "#2c3a32",
        primaryBorderColor: "#2f5a40",
        lineColor: "#4a7c59",
        secondaryColor: "#ecefe6",
        tertiaryColor: "#f7f3e8",
      },
    });
  })();
  return mermaidInitialization;
}

async function renderDiagrams(article: HTMLElement): Promise<void> {
  const panels = [...article.querySelectorAll<HTMLElement>(".md-diagram-panel")];
  if (panels.length === 0) return;

  const renderId = ++diagramRenderSequence;
  await initializeMermaid();
  if (renderId !== diagramRenderSequence || !article.isConnected) return;
  for (const [index, panel] of panels.entries()) {
    const source = panel.querySelector("code")?.textContent ?? "";
    const diagramId = `linguamark-mermaid-${renderId}-${index}`;
    try {
      if (renderId !== diagramRenderSequence || !article.isConnected) return;
      const { svg } = await mermaid.render(diagramId, source);
      removeMermaidScratch(diagramId);
      if (renderId !== diagramRenderSequence || !panel.isConnected) {
        removeMermaidScratch(diagramId);
        return;
      }
      panel.innerHTML = svg;
      secureInteractiveContent(panel);
    } catch (error: unknown) {
      removeMermaidScratch(diagramId);
      panel.querySelector("pre")?.setAttribute("data-render-error", "true");
      logWarn("content", "markdown.mermaid.failed", { diagramIndex: index, errorName: errorName(error) });
    }
  }
}

function removeMermaidScratch(diagramId: string): void {
  document.getElementById(`d${diagramId}`)?.remove();
}

function createViewer(article: HTMLElement): ViewerElements {
  const settingsPage = createSettingsPage();
  const documentSidebar = createTableOfContents(article);
  const toolbar = document.createElement("header");
  toolbar.className = "linguamark-markdown-toolbar";
  toolbar.dataset.linguamarkUi = "";

  const sidebarToggle = document.createElement("button");
  sidebarToggle.type = "button";
  sidebarToggle.className = "linguamark-markdown-directory-button";
  sidebarToggle.setAttribute("aria-controls", "linguamark-markdown-toc");
  sidebarToggle.append(createToolbarIcon("sidebar"));
  const sidebarControl = document.createElement("button");
  sidebarControl.type = "button";
  sidebarControl.className = "linguamark-markdown-directory-button";
  sidebarControl.setAttribute("aria-controls", "linguamark-markdown-toc");
  sidebarControl.append(createToolbarIcon("list"));

  const importButton = document.createElement("button");
  importButton.type = "button";
  importButton.className = "linguamark-markdown-directory-button";
  importButton.title = "导入 Markdown、JSON、HTML、PDF 文件或目录（⌘O / Ctrl+O）";
  importButton.setAttribute("aria-label", "导入文件或目录");
  importButton.append(createToolbarIcon("folder"));
  const fileName = document.createElement("span");
  fileName.className = "linguamark-markdown-file-name";
  fileName.textContent = "未打开文档";
  fileName.title = fileName.textContent;

  const widthButton = document.createElement("button");
  widthButton.type = "button";
  widthButton.className = "linguamark-markdown-directory-button linguamark-markdown-width-button";
  widthButton.setAttribute("aria-pressed", "false");
  const widthIcon = createToolbarIcon("width");
  const widthLabel = document.createElement("span");
  widthLabel.className = "linguamark-markdown-action-label";
  widthButton.append(widthIcon, widthLabel);
  const setFullWidth = (fullWidth: boolean): void => {
    document.body.classList.toggle("linguamark-full-width", fullWidth);
    widthButton.setAttribute("aria-pressed", String(fullWidth));
    widthLabel.textContent = fullWidth ? "整屏宽度" : "固定宽度";
    const nextMode = fullWidth ? "固定宽度" : "整屏宽度";
    widthButton.setAttribute("aria-label", `当前${widthLabel.textContent}，点击切换为${nextMode}`);
    widthButton.title = `切换为${nextMode}`;
  };
  widthButton.addEventListener("click", () => {
    const readingWidth = getSettings().readingWidth === "full" ? "fixed" : "full";
    const error = updateSettings({ readingWidth });
    if (error) showDirectoryNotice(error);
  });

  subscribeSettings((settings) => {
    applyTypography(settings);
    setFullWidth(settings.readingWidth === "full");
    document.documentElement.classList.toggle("linguamark-reload-scroll-animation", settings.reloadAnimation);
  });

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.className = "linguamark-markdown-directory-button linguamark-markdown-favorite-button";
  favoriteButton.disabled = true;
  favoriteButton.setAttribute("aria-pressed", "false");
  const favoriteIcon = document.createElement("span");
  favoriteIcon.className = "linguamark-markdown-action-icon";
  favoriteIcon.setAttribute("aria-hidden", "true");
  favoriteIcon.append(createToolbarIcon("star"));
  const favoriteLabel = document.createElement("span");
  favoriteLabel.className = "linguamark-markdown-action-label";
  favoriteLabel.textContent = "收藏";
  favoriteButton.append(favoriteIcon, favoriteLabel);

  const libraryButton = document.createElement("button");
  libraryButton.type = "button";
  libraryButton.className = "linguamark-markdown-directory-button linguamark-markdown-library-button";
  libraryButton.setAttribute("aria-haspopup", "dialog");
  libraryButton.setAttribute("aria-controls", "linguamark-markdown-library");
  libraryButton.setAttribute("aria-label", "查看收藏与最近浏览");
  libraryButton.title = "收藏与最近浏览";
  const libraryIcon = createToolbarIcon("library");
  const libraryLabel = document.createElement("span");
  libraryLabel.className = "linguamark-markdown-action-label";
  libraryLabel.textContent = "收藏列表";
  libraryButton.append(libraryIcon, libraryLabel);

  const actions = document.createElement("div");
  actions.className = "linguamark-markdown-toolbar-actions";
  const settingsButton = document.createElement("button");
  settingsButton.type = "button";
  settingsButton.className = "linguamark-markdown-directory-button";
  settingsButton.append(createToolbarIcon("settings"));
  settingsButton.setAttribute("aria-label", "设置");
  settingsButton.title = "设置（⌘, / Ctrl+,）";
  settingsButton.setAttribute("aria-haspopup", "dialog");
  settingsButton.setAttribute("aria-controls", "reader-settings");
  settingsButton.addEventListener("click", settingsPage.open);
  actions.append(widthButton, favoriteButton, libraryButton, settingsButton);
  const navigation = document.createElement("div");
  navigation.className = "linguamark-markdown-toolbar-navigation";
  navigation.append(sidebarToggle, sidebarControl, importButton);
  toolbar.append(navigation, fileName, actions);

  const shell = document.createElement("div");
  shell.className = "linguamark-markdown-shell";
  const content = document.createElement("div");
  content.className = "linguamark-markdown-content";
  content.tabIndex = 0;
  content.setAttribute("role", "region");
  content.setAttribute("aria-label", "阅读正文");
  content.append(article);
  const resizer = document.createElement("div");
  resizer.className = "linguamark-markdown-toc-resizer";
  resizer.dataset.linguamarkUi = "";
  resizer.tabIndex = -1;
  resizer.setAttribute("role", "separator");
  resizer.setAttribute("aria-controls", "linguamark-markdown-toc");
  resizer.setAttribute("aria-orientation", "vertical");
  resizer.setAttribute("aria-valuemin", "200");
  resizer.title = "拖动调整侧栏宽度";
  const backdrop = document.createElement("button");
  backdrop.type = "button";
  backdrop.className = "linguamark-markdown-toc-backdrop";
  backdrop.dataset.linguamarkUi = "";
  backdrop.setAttribute("aria-label", "关闭侧栏");

  const characterCountLabel = document.createElement("output");
  characterCountLabel.className = "linguamark-markdown-character-count";
  characterCountLabel.dataset.linguamarkUi = "";
  characterCountLabel.setAttribute("aria-live", "polite");
  const setContentCount = (source: string): void => {
    const formatted = contentCount(source).toLocaleString("zh-CN");
    characterCountLabel.textContent = `${formatted} 字词`;
    characterCountLabel.setAttribute("aria-label", `当前内容共 ${formatted} 字词`);
  };
  setContentCount("");

  const library = createViewerLibrary();
  shell.append(content, resizer, backdrop, characterCountLabel);

  const narrowScreen = matchMedia("(max-width: 900px)");
  const minimumSidebarWidth = 200;
  const defaultSidebarWidth = 272;
  const sidebars: Record<SidebarView, HTMLElement | undefined> = {
    files: undefined,
    outline: documentSidebar,
  };
  const sidebarLabels: Record<SidebarView, string> = {
    files: "文件树",
    outline: "文章目录",
  };
  let activeSidebar: HTMLElement | undefined;
  let sidebarView: SidebarView = "outline";
  let sidebarOpen = false;
  let sidebarWidth = defaultSidebarWidth;
  let sidebarResizePointer: number | undefined;
  const maximumSidebarWidth = (): number => Math.max(defaultSidebarWidth, Math.floor(innerWidth / 2));
  const setSidebarWidth = (width: number): void => {
    const maximum = maximumSidebarWidth();
    sidebarWidth = Math.min(Math.max(Math.round(width), minimumSidebarWidth), maximum);
    shell.style.setProperty("--linguamark-markdown-toc-width", `${sidebarWidth}px`);
    resizer.setAttribute("aria-valuemax", String(maximum));
    resizer.setAttribute("aria-valuenow", String(sidebarWidth));
    resizer.setAttribute("aria-valuetext", `${sidebarWidth} 像素`);
  };
  const syncSidebar = (): void => {
    const nextSidebar = sidebars[sidebarView];
    if (activeSidebar !== nextSidebar) {
      activeSidebar?.remove();
      activeSidebar = nextSidebar;
      if (activeSidebar) {
        shell.insertBefore(activeSidebar, content);
        shell.insertBefore(resizer, content);
        if (sidebarView === "files") {
          const tree = activeSidebar;
          requestAnimationFrame(() => {
            if (activeSidebar !== tree || !sidebarOpen) return;
            const path = tree.querySelector<HTMLElement>(".linguamark-directory-file.is-active")?.dataset.directoryPath ?? "";
            setActiveDirectoryPath(path, tree);
          });
        }
      }
    }
    sidebarControl.disabled = !sidebars.files || !sidebars.outline;
    sidebarToggle.disabled = !sidebars.files && !sidebars.outline;
    resizer.setAttribute("aria-label", `调整${sidebarLabels[sidebarView]}宽度`);
    shell.classList.toggle("has-no-toc", !activeSidebar);
  };
  const setSidebarOpen = (open: boolean): void => {
    sidebarOpen = Boolean(activeSidebar) && open;
    document.body.classList.toggle("linguamark-toc-open", sidebarOpen);
    sidebarToggle.setAttribute("aria-expanded", String(sidebarOpen));
    sidebarToggle.title = sidebarOpen ? "隐藏侧栏" : "显示侧栏";
    sidebarToggle.setAttribute("aria-label", sidebarToggle.title);
    const nextView = sidebarView === "files" ? "outline" : "files";
    sidebarControl.title = `当前：${sidebarLabels[sidebarView]}；切换到${sidebarLabels[nextView]}`;
    sidebarControl.setAttribute("aria-label", sidebarControl.title);
    resizer.tabIndex = sidebarOpen && !narrowScreen.matches ? 0 : -1;
    backdrop.hidden = !sidebarOpen;
  };
  const setSidebar = (view: SidebarView, sidebar: HTMLElement | undefined, activate = false): void => {
    const wasOpen = sidebarOpen;
    sidebars[view] = sidebar;
    if (activate && sidebar) sidebarView = view;
    if (!sidebars[sidebarView]) sidebarView = sidebars.files ? "files" : "outline";
    syncSidebar();
    setSidebarOpen(activate ? !narrowScreen.matches : wasOpen);
  };

  resizer.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || sidebarResizePointer !== undefined || narrowScreen.matches || !sidebarOpen) return;
    sidebarResizePointer = event.pointerId;
    resizer.setPointerCapture(event.pointerId);
    document.body.classList.add("linguamark-toc-resizing");
    event.preventDefault();
  });
  resizer.addEventListener("pointermove", (event) => {
    if (event.pointerId !== sidebarResizePointer) return;
    setSidebarWidth(event.clientX - shell.getBoundingClientRect().left);
  });
  const finishSidebarResize = (event: PointerEvent): void => {
    if (event.pointerId !== sidebarResizePointer) return;
    if (resizer.hasPointerCapture(event.pointerId)) resizer.releasePointerCapture(event.pointerId);
    sidebarResizePointer = undefined;
    document.body.classList.remove("linguamark-toc-resizing");
  };
  resizer.addEventListener("pointerup", finishSidebarResize);
  resizer.addEventListener("pointercancel", finishSidebarResize);
  resizer.addEventListener("lostpointercapture", () => {
    sidebarResizePointer = undefined;
    document.body.classList.remove("linguamark-toc-resizing");
  });
  resizer.addEventListener("keydown", (event) => {
    let width: number;
    if (event.key === "ArrowLeft") width = sidebarWidth - 16;
    else if (event.key === "ArrowRight") width = sidebarWidth + 16;
    else if (event.key === "Home") width = minimumSidebarWidth;
    else if (event.key === "End") width = maximumSidebarWidth();
    else return;
    event.preventDefault();
    setSidebarWidth(width);
  });
  sidebarToggle.addEventListener("click", () => setSidebarOpen(!sidebarOpen));
  sidebarControl.addEventListener("click", () => {
    const view = sidebarView === "files" ? "outline" : "files";
    if (!sidebars[view]) return;
    sidebarView = view;
    syncSidebar();
    setSidebarOpen(true);
  });
  backdrop.addEventListener("click", () => setSidebarOpen(false));
  shell.addEventListener("click", (event) => {
    if (narrowScreen.matches
      && event.target instanceof Element
      && event.target.closest("#linguamark-markdown-toc a, #linguamark-markdown-toc button[data-directory-path]")) {
      setSidebarOpen(false);
    }
  });
  narrowScreen.addEventListener("change", (event) => setSidebarOpen(Boolean(activeSidebar) && !event.matches));
  addEventListener("resize", () => {
    if (!narrowScreen.matches) setSidebarWidth(sidebarWidth);
  }, { passive: true });
  addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebarOpen && !settingsPage.dialog.open) setSidebarOpen(false);
  });
  setSidebarWidth(defaultSidebarWidth);
  setSidebar("outline", documentSidebar, true);

  return {
    toolbar,
    shell,
    content,
    fileName,
    importButton,
    favoriteButton,
    favoriteIcon,
    favoriteLabel,
    libraryButton,
    libraryDialog: library.dialog,
    settingsDialog: settingsPage.dialog,
    openSettings: settingsPage.open,
    favoriteList: library.favoriteList,
    recentList: library.recentList,
    setSidebar,
    openSidebar() {
      setSidebarOpen(true);
    },
    setPath(path) {
      fileName.textContent = path.replaceAll("\\", "/").split("/").filter(Boolean).at(-1) ?? path;
      fileName.title = path;
    },
    setContentCount,
    setActiveFile(path) {
      if (sidebars.files) setActiveDirectoryPath(path, sidebars.files);
    },
  };
}

function createViewerLibrary(): ViewerLibraryElements {
  const dialog = document.createElement("dialog");
  dialog.id = "linguamark-markdown-library";
  dialog.className = "linguamark-markdown-library";
  dialog.dataset.linguamarkUi = "";
  dialog.setAttribute("aria-labelledby", "linguamark-markdown-library-title");

  const panel = document.createElement("div");
  panel.className = "linguamark-markdown-library-panel";
  const header = document.createElement("div");
  header.className = "linguamark-markdown-library-header";
  const title = document.createElement("h2");
  title.id = "linguamark-markdown-library-title";
  title.textContent = "收藏与最近浏览";
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "linguamark-markdown-library-close";
  closeButton.setAttribute("aria-label", "关闭收藏列表");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", () => dialog.close());
  header.append(title, closeButton);

  const grid = document.createElement("div");
  grid.className = "linguamark-markdown-library-grid";
  const favorites = createViewerLibrarySection("全部收藏");
  const recents = createViewerLibrarySection("最近浏览");
  grid.append(favorites.section, recents.section);
  panel.append(header, grid);
  dialog.append(panel);
  return { dialog, favoriteList: favorites.list, recentList: recents.list };
}

function createViewerLibrarySection(titleText: string): { section: HTMLElement; list: HTMLUListElement } {
  const section = document.createElement("section");
  section.className = "linguamark-markdown-library-section";
  const title = document.createElement("h3");
  title.textContent = titleText;
  const list = document.createElement("ul");
  list.className = "linguamark-markdown-library-list";
  section.append(title, list);
  return { section, list };
}

function initializeViewerLibrary(viewer: ViewerElements): void {
  renderViewerLibrary(viewer);
  viewer.favoriteButton.addEventListener("click", () => {
    void toggleViewerFavorite(viewer);
  });
  viewer.libraryButton.addEventListener("click", () => {
    openViewerLibrary(viewer);
  });

  const initialItem = viewer.currentItem;
  viewerLibraryReady = readLibrary().then((stored) => {
    viewerFavorites = readViewerItems(stored[VIEWER_FAVORITES_KEY]);
    viewerRecents = readViewerItems(stored[VIEWER_RECENTS_KEY], MAX_VIEWER_RECENTS);
    viewerLibraryLoaded = true;
    updateViewerFavoriteButton(viewer);
    renderViewerLibrary(viewer);

  });

  void viewerLibraryReady
    .then(() => initialItem ? recordViewerRecent(initialItem, viewer) : undefined)
    .catch((error: unknown) => {
      logWarn("content", "markdown.library.initialize.failed", { errorName: errorName(error) });
      showDirectoryNotice("无法读取收藏与最近浏览记录");
    });
}

async function toggleViewerFavorite(viewer: ViewerElements, item: ViewerItem | undefined = viewer.currentItem): Promise<void> {
  if (!viewerLibraryLoaded || !item) return;
  const previous = viewerFavorites;
  const keys = viewerFavoriteKeys(item, viewer);
  const saved = viewerFavorites.some((favorite) => keys.has(viewerItemKey(favorite)));
  viewerFavorites = saved
    ? viewerFavorites.filter((favorite) => !keys.has(viewerItemKey(favorite)))
    : [item, ...viewerFavorites.filter((favorite) => !keys.has(viewerItemKey(favorite)))];
  updateViewerFavoriteButton(viewer);
  renderViewerLibrary(viewer);

  try {
    await writeLibrary({ [VIEWER_FAVORITES_KEY]: viewerFavorites });
  } catch (error: unknown) {
    viewerFavorites = previous;
    updateViewerFavoriteButton(viewer);
    renderViewerLibrary(viewer);
    logWarn("content", "markdown.favorite.save.failed", { errorName: errorName(error) });
    showDirectoryNotice("收藏保存失败");
  }
}

function openViewerLibrary(viewer: ViewerElements): void {
  try {
    if (!viewer.libraryDialog.open) viewer.libraryDialog.showModal();
  } catch (error: unknown) {
    logWarn("content", "markdown.library.open.failed", { errorName: errorName(error) });
    showDirectoryNotice("无法打开收藏列表");
  }
}

function setViewerCurrentItem(viewer: ViewerElements, item: ViewerItem): void {
  viewer.currentItem = item;
  updateViewerFavoriteButton(viewer);
  const ready = viewerLibraryReady;
  if (!ready) return;
  void ready.then(() => recordViewerRecent(item, viewer)).catch((error: unknown) => {
    logWarn("content", "markdown.recent.save.failed", { errorName: errorName(error) });
  });
}

async function recordViewerRecent(item: ViewerItem, viewer: ViewerElements): Promise<void> {
  const key = viewerItemKey(item);
  if (viewerRecents[0] && viewerItemKey(viewerRecents[0]) === key) return;
  viewerRecents = [item, ...viewerRecents.filter((recent) => viewerItemKey(recent) !== key)]
    .slice(0, MAX_VIEWER_RECENTS);
  renderViewerLibrary(viewer);
  try {
    await writeLibrary({ [VIEWER_RECENTS_KEY]: viewerRecents });
  } catch (error: unknown) {
    logWarn("content", "markdown.recent.save.failed", { errorName: errorName(error) });
  }
}

function updateViewerFavoriteButton(viewer: ViewerElements): void {
  const item = viewer.currentItem;
  const saved = Boolean(item && isViewerFavorite(item, viewer));
  viewer.favoriteButton.disabled = !viewerLibraryLoaded || !item;
  viewer.favoriteButton.classList.toggle("is-saved", saved);
  viewer.favoriteButton.setAttribute("aria-pressed", String(saved));
  viewer.favoriteIcon.classList.toggle("is-filled", saved);
  viewer.favoriteLabel.textContent = saved ? "已收藏" : "收藏";
  const action = saved ? "取消收藏" : "收藏";
  viewer.favoriteButton.setAttribute("aria-label", item ? `${action}${viewerItemLabel(item)} ${item.path}` : "请先打开目录或文件");
  viewer.favoriteButton.title = item ? `${action}：${item.path}` : "请先打开目录或文件";
}

function renderViewerLibrary(viewer: ViewerElements): void {
  const favorites = viewerFavoritesForDisplay(viewer);
  renderViewerItems(viewer.favoriteList, favorites, "暂无收藏", viewer);
  renderViewerItems(viewer.recentList, viewerRecents, "暂无浏览记录", viewer);
  const emptyFavorites = viewer.content.querySelector<HTMLUListElement>('[data-viewer-items="favorites"]');
  const emptyRecents = viewer.content.querySelector<HTMLUListElement>('[data-viewer-items="recents"]');
  if (emptyFavorites) renderViewerItems(emptyFavorites, favorites, "暂无收藏", viewer);
  if (emptyRecents) renderViewerItems(emptyRecents, viewerRecents, "暂无浏览记录", viewer);
}

function renderViewerItems(
  list: HTMLUListElement,
  items: ViewerItem[],
  emptyText: string,
  viewer: ViewerElements,
): void {
  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "linguamark-markdown-library-empty";
    empty.textContent = emptyText;
    list.replaceChildren(empty);
    return;
  }

  list.replaceChildren(...items.map((item) => {
    const row = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "linguamark-markdown-library-item";
    button.title = item.path;
    button.setAttribute("aria-label", `打开${viewerItemLabel(item)} ${item.path}`);
    const kind = document.createElement("span");
    kind.className = `linguamark-markdown-library-kind is-${item.kind}`;
    kind.textContent = viewerItemLabel(item);
    const path = document.createElement("span");
    path.className = "linguamark-markdown-library-path";
    path.textContent = item.path;
    button.append(kind, path);
    button.addEventListener("click", () => {
      void openViewerItem(item, viewer);
    });
    row.append(button);
    return row;
  }));
}

async function openViewerItem(item: ViewerItem, viewer: ViewerElements): Promise<void> {
  viewer.libraryDialog.close();
  if (item.kind === "directory") await openNativeDirectory(item.path, viewer);
  else await openNativeFile(item.path, viewer);
}

function readViewerItems(value: unknown, limit = Number.POSITIVE_INFINITY): ViewerItem[] {
  if (!Array.isArray(value)) return [];
  const items: ViewerItem[] = [];
  const keys = new Set<string>();
  for (const candidate of value) {
    if (!isRecord(candidate)
      || (candidate.kind !== "directory" && candidate.kind !== "file")
      || typeof candidate.path !== "string"
      || !candidate.path.trim()) {
      continue;
    }
    const item: ViewerItem = { kind: candidate.kind, path: candidate.path };
    const key = viewerItemKey(item);
    if (keys.has(key)) continue;
    keys.add(key);
    items.push(item);
    if (items.length >= limit) break;
  }
  return items;
}

function viewerItemKey(item: ViewerItem): string {
  return `${item.kind}:${item.path}`;
}

function viewerFavoriteKeys(item: ViewerItem, _viewer: ViewerElements): Set<string> {
  return new Set([viewerItemKey(item)]);
}

function isViewerFavorite(item: ViewerItem, viewer: ViewerElements): boolean {
  const keys = viewerFavoriteKeys(item, viewer);
  return viewerFavorites.some((favorite) => keys.has(viewerItemKey(favorite)));
}

function viewerFavoritesForDisplay(viewer: ViewerElements): ViewerItem[] {
  const seen = new Set<string>();
  return viewerFavorites.filter((favorite) => {
    const keys = viewerFavoriteKeys(favorite, viewer);
    if ([...keys].some((key) => seen.has(key))) return false;
    for (const key of keys) seen.add(key);
    return true;
  });
}

function viewerItemLabel(item: ViewerItem): string {
  return item.kind === "directory" ? "目录" : "文件";
}

function createTableOfContents(article: HTMLElement): HTMLElement | undefined {
  if (article.hasAttribute("data-linguamark-ignore")) return undefined;
  const placeholders = [...article.querySelectorAll("p")]
    .filter((paragraph) => paragraph.childElementCount === 0 && paragraph.textContent?.trim().toUpperCase() === "[TOC]");
  for (const placeholder of placeholders) placeholder.remove();

  const headings = [...article.querySelectorAll<HTMLHeadingElement>("h1, h2, h3, h4, h5, h6")];
  if (headings.length === 0) return undefined;

  const usedIds = new Set<string>();
  for (const heading of headings) {
    const base = heading.id || slugify(heading.textContent ?? "") || "section";
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    heading.id = id;
    usedIds.add(id);
  }

  const minimumLevel = Math.min(...headings.map(headingLevel));
  const sidebar = document.createElement("aside");
  sidebar.id = "linguamark-markdown-toc";
  sidebar.className = "linguamark-markdown-toc";
  sidebar.dataset.linguamarkUi = "";
  sidebar.setAttribute("aria-label", "文档目录");
  const title = document.createElement("p");
  title.className = "linguamark-markdown-toc-title";
  title.textContent = "目录";
  const navigation = document.createElement("nav");
  const list = document.createElement("ul");
  list.className = "linguamark-markdown-toc-list";
  for (const heading of headings) {
    const item = document.createElement("li");
    item.style.setProperty("--toc-depth", String(headingLevel(heading) - minimumLevel));
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent?.trim() || "未命名章节";
    item.append(link);
    list.append(item);
  }
  navigation.append(list);
  sidebar.append(title, navigation);
  return sidebar;
}

function initializeNativeNavigation(viewer: ViewerElements): void {
  initializeDocumentSearch(viewer.content, viewer.shell, () => !pickerOpen);
  let saveScrollTimer: number | undefined;
  viewer.content.addEventListener("scroll", () => {
    if (restoringSession || !viewer.currentItem) return;
    clearTimeout(saveScrollTimer);
    saveScrollTimer = window.setTimeout(() => saveSession(viewer), 150);
  }, { passive: true });
  addEventListener("pagehide", () => { if (!restoringSession) saveSession(viewer); });
  for (const type of ["wheel", "touchstart", "pointerdown", "keydown"]) {
    addEventListener(type, () => { if (restoringSession) restoreScrollCancelled = true; }, { passive: true });
  }
  viewer.importButton.addEventListener("click", () => { void chooseNative(false, viewer); });
  addEventListener("keydown", (event) => {
    if (event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "r") {
      event.preventDefault();
      if (!event.repeat && !pickerOpen && !document.querySelector("body > dialog[open]")
        && viewer.currentItem?.kind === "file") {
        directoryImageCache.clear();
        void openNativeFile(viewer.currentItem.path, viewer);
      }
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key === ",") {
      event.preventDefault();
      if (!pickerOpen) {
        viewer.libraryDialog.close();
        viewer.openSettings();
      }
      return;
    }
    if (viewer.settingsDialog.open) return;
    const target = event.target;
    if (!event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.altKey
      && ["PageDown", "PageUp", "Home", "End"].includes(event.key)
      && !document.querySelector("body > dialog[open]")
      && getComputedStyle(viewer.content).overflowY !== "hidden"
      && target instanceof Element && (target === document.body || viewer.toolbar.contains(target)
        || viewer.content.querySelector(".linguamark-pdf-toolbar")?.contains(target))
      && !target.closest("input, textarea, select, [contenteditable]")) {
      event.preventDefault();
      const scrollContainer = viewer.content.querySelector<HTMLElement>(".linguamark-pdf-viewport") ?? viewer.content;
      if (event.key === "Home" || event.key === "End") {
        scrollContainer.scrollTo({ top: event.key === "Home" ? 0 : scrollContainer.scrollHeight, behavior: "auto" });
      } else {
        scrollContainer.scrollBy({ top: scrollContainer.clientHeight * 0.9 * (event.key === "PageDown" ? 1 : -1), behavior: "auto" });
      }
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "o") {
      event.preventDefault();
      void chooseNative(event.shiftKey, viewer);
    }
  });
  document.addEventListener("contextmenu", (event) => {
    const anchor = event.target instanceof Element
      ? event.target.closest<HTMLAnchorElement>(".linguamark-markdown-toc-list a[href]") : null;
    const item = viewer.currentItem;
    if (!anchor || !viewer.shell.contains(anchor) || item?.kind !== "file") return;
    event.preventDefault();
    showContextMenu(event, anchor, [{ label: "Copy Link", action: () => copyToClipboard(item.path) }]);
  });
  document.addEventListener("click", (event) => {
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!anchor || !viewer.content.contains(anchor)) return;
    const href = anchor.getAttribute("href") ?? "";
    if (href.startsWith("#")) return;
    event.preventDefault();
    if (/^https?:\/\//iu.test(href)) {
      void openExternal(href).catch((error: unknown) => showDirectoryNotice(errorMessage(error)));
    }
  });
}

async function chooseNative(directoryOnly: boolean, viewer: ViewerElements): Promise<void> {
  if (pickerOpen) return;
  pickerOpen = true;
  ++navigationSequence;
  try {
    if (directoryOnly) {
      const path = await pickDirectory();
      if (path) await openNativeDirectory(path, viewer);
      return;
    }
    const entry = await pickEntry();
    if (!entry) return;
    if (entry.kind === "directory") await openNativeDirectory(entry.path, viewer);
    else await openNativeFile(entry.path, viewer);
  } catch (error: unknown) {
    showDirectoryNotice(errorMessage(error));
  } finally {
    pickerOpen = false;
  }
}

function saveSession(viewer: ViewerElements): void {
  if (!viewer.currentItem || restoringSession) return;
  try {
    localStorage.setItem(VIEWER_SESSION_KEY, JSON.stringify({
      item: viewer.currentItem, root: viewer.directoryRootName, scrollTop: Math.max(0, viewer.content.scrollTop),
    }));
  } catch { showDirectoryNotice("无法保存阅读位置"); }
}

async function restoreSession(viewer: ViewerElements): Promise<void> {
  const sequence = navigationSequence;
  restoringSession = true;
  restoreScrollCancelled = false;
  try {
    const session: unknown = JSON.parse(localStorage.getItem(VIEWER_SESSION_KEY) ?? "null");
    if (!isRecord(session)) return;
    const item = readViewerItems([session.item])[0];
    const state = typeof session.root === "string" ? await readDirectory(session.root) : undefined;
    if (sequence !== navigationSequence) return;
    if (state) applyDirectoryState(state, viewer);
    if (item?.kind === "file") await openNativeFile(item.path, viewer);
    else if (item?.kind === "directory") await openNativeDirectory(item.path, viewer);
    await documentRenderReady;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    if (!restoreScrollCancelled && navigationSequence === sequence + 1
      && item && viewer.currentItem && viewerItemKey(item) === viewerItemKey(viewer.currentItem)
      && typeof session.scrollTop === "number" && Number.isFinite(session.scrollTop)) {
      const smooth = getSettings().reloadAnimation && !matchMedia("(prefers-reduced-motion: reduce)").matches;
      viewer.content.scrollTo({ top: Math.max(0, session.scrollTop), behavior: smooth ? "smooth" : "instant" });
    }
  } catch (error: unknown) {
    if (sequence === navigationSequence) showDirectoryNotice(`无法恢复阅读位置：${errorMessage(error)}`);
  } finally {
    restoringSession = false;
    saveSession(viewer);
  }
}

function applyDirectoryState(state: DirectoryBrowserState, viewer: ViewerElements): void {
  viewer.directoryRootName = state.rootName;
  directoryImageCache.clear();
  viewer.setSidebar("files", createDirectorySidebar(state, viewer), true);
  const sidebar = document.querySelector<HTMLElement>(".linguamark-directory-sidebar");
  if (sidebar) viewer.setActiveFile(currentDirectoryPath(viewer, sidebar));
  updateViewerFavoriteButton(viewer);
  renderViewerLibrary(viewer);
}

async function openNativeDirectory(path: string, viewer: ViewerElements): Promise<void> {
  const sequence = ++navigationSequence;
  try {
    const state = await readDirectory(path);
    if (sequence !== navigationSequence) return;
    disposePdf?.();
    disposePdf = undefined;
    ++directoryRenderSequence;
    ++diagramRenderSequence;
    documentRenderReady = Promise.resolve();
    viewer.content.replaceChildren(createEmptyViewerArticle());
    viewer.setSidebar("outline", undefined);
    viewer.setContentCount("");
    replaceCustomStyle("");
    applyDirectoryState(state, viewer);
    viewer.setPath(state.rootName ?? path);
    setViewerCurrentItem(viewer, { kind: "directory", path: state.rootName ?? path });
    renderViewerLibrary(viewer);
    document.title = "LinguaMark Reader";
    clearDirectoryNotice();
    saveSession(viewer);
  } catch (error: unknown) {
    if (sequence === navigationSequence) showDirectoryNotice(errorMessage(error));
  }
}

async function openNativeFile(path: string, viewer: ViewerElements, hash?: string): Promise<void> {
  const sequence = ++navigationSequence;
  try {
    const file = await readFile(path);
    if (sequence !== navigationSequence) return;
    const root = viewer.directoryRootName;
    const prefix = root ? `${root.replace(/\/$/u, "")}/` : "";
    const relative = prefix && path.startsWith(prefix) ? path.slice(prefix.length) : undefined;
    disposePdf?.();
    disposePdf = undefined;
    if (file.kind === "markdown" || file.kind === "html") {
      if (relative) renderDirectoryMarkdown({ ...file, path: relative }, viewer, hash);
      else {
        const { article, customCss } = createArticle(file.text, file.kind);
        ++directoryRenderSequence;
        disableStandaloneRelativeResources(article);
        viewer.content.replaceChildren(article);
        viewer.setContentCount(file.kind === "html" ? article.textContent ?? "" : file.text);
        viewer.setSidebar("outline", createTableOfContents(article), true);
        viewer.setPath(path);
        replaceCustomStyle(customCss);
        document.title = article.querySelector("h1")?.textContent?.trim() || path.split("/").at(-1) || "Markdown";
        resetLocationHash();
        trackDocumentRender(article);
      }
    } else if (file.kind === "json") renderJson(file, viewer);
    else if (file.kind === "pdf") renderPdf(file, viewer);
    else renderDirectoryImage(file, viewer);
    setViewerCurrentItem(viewer, { kind: "file", path });
    viewer.setActiveFile(relative ?? "");
    viewer.content.scrollTo({ top: 0, behavior: "instant" });
    clearDirectoryNotice();
    saveSession(viewer);
  } catch (error: unknown) {
    if (sequence === navigationSequence) showDirectoryNotice(errorMessage(error));
  }
}

function disableStandaloneRelativeResources(article: HTMLElement): void {
  for (const image of article.querySelectorAll<HTMLImageElement>("img[src]")) {
    const source = image.getAttribute("src");
    if (!source || source.startsWith("data:")) continue;
    image.removeAttribute("src");
    image.removeAttribute("srcset");
    image.title = "打开所在目录后才能读取相对图片；不自动加载远程图片";
    image.classList.add("linguamark-directory-image-error");
  }
  for (const anchor of article.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    const href = anchor.getAttribute("href") ?? "";
    if (href.startsWith("#") || /^https?:\/\//iu.test(href)) continue;
    anchor.removeAttribute("href");
    anchor.setAttribute("aria-disabled", "true");
    anchor.title = "打开所在目录后才能跳转相对文件";
  }
}

function createDirectorySidebar(state: DirectoryBrowserState, viewer: ViewerElements): HTMLElement {
  const sidebar = document.createElement("aside");
  sidebar.id = "linguamark-markdown-toc";
  sidebar.className = "linguamark-markdown-toc linguamark-directory-sidebar";
  sidebar.dataset.linguamarkUi = "";
  sidebar.setAttribute("aria-label", "目录文件树");
  const panel = document.createElement("div");
  panel.className = "linguamark-directory-tree";
  const title = document.createElement("p");
  title.className = "linguamark-markdown-toc-title";
  title.textContent = state.rootName?.split("/").filter(Boolean).at(-1) ?? "文件";
  title.title = state.rootName ?? "文件";
  title.dataset.directoryPath = "";
  title.tabIndex = 0;
  title.setAttribute("aria-haspopup", "menu");
  panel.append(title);
  panel.addEventListener("contextmenu", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLElement>("[data-directory-path]")
      : null;
    if (!target || !panel.contains(target)) return;
    event.preventDefault();
    showDirectoryContextMenu(event, target, viewer);
  });

  if (!state.entries || state.entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "linguamark-directory-empty";
    empty.textContent = "目录为空";
    panel.append(empty);
    sidebar.append(panel);
    return sidebar;
  }

  const tree = document.createElement("ul");
  tree.className = "linguamark-directory-list";
  for (const entry of state.entries) tree.append(createDirectoryTreeItem(entry, viewer));

  const controls = document.createElement("div");
  controls.className = "linguamark-directory-toolbar";
  controls.setAttribute("role", "toolbar");
  controls.setAttribute("aria-label", "文件树控制");
  const folderToggle = document.createElement("button");
  folderToggle.type = "button";
  folderToggle.className = "linguamark-markdown-directory-button linguamark-directory-toolbar-button";
  const updateFolderToggle = (): void => {
    const folders = [...tree.querySelectorAll<HTMLDetailsElement>("details")];
    const allExpanded = folders.length > 0 && folders.every((folder) => folder.open);
    folderToggle.disabled = folders.length === 0;
    folderToggle.replaceChildren(createToolbarIcon(allExpanded ? "collapseAll" : "expandAll"));
    folderToggle.title = allExpanded ? "全部折叠" : "全部展开";
    folderToggle.setAttribute("aria-label", folderToggle.title);
    folderToggle.setAttribute("aria-pressed", String(allExpanded));
  };
  folderToggle.addEventListener("click", () => {
    const expand = folderToggle.getAttribute("aria-pressed") !== "true";
    for (const details of tree.querySelectorAll<HTMLDetailsElement>("details")) details.open = expand;
    updateFolderToggle();
  });
  tree.addEventListener("toggle", updateFolderToggle, true);
  updateFolderToggle();

  const focusButton = document.createElement("button");
  focusButton.type = "button";
  focusButton.className = "linguamark-markdown-directory-button linguamark-directory-toolbar-button linguamark-directory-focus-button";
  focusButton.append(createToolbarIcon("locate"));
  focusButton.setAttribute("aria-label", "定位当前文件");
  focusButton.title = "在文件列表中定位当前打开的文件";
  focusButton.disabled = true;
  focusButton.addEventListener("click", () => {
    const path = tree.querySelector<HTMLButtonElement>(".linguamark-directory-file.is-active")?.dataset.directoryPath;
    if (path) setActiveDirectoryPath(path);
  });
  controls.append(folderToggle, focusButton);
  panel.append(tree);
  sidebar.append(controls, panel);
  return sidebar;
}

function createDirectoryTreeItem(entry: DirectoryTreeEntry, viewer: ViewerElements): HTMLLIElement {
  const item = document.createElement("li");
  if (entry.type === "directory") {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.dataset.directoryPath = entry.path;
    summary.setAttribute("aria-haspopup", "menu");
    summary.textContent = entry.name;
    summary.title = entry.path;
    const children = document.createElement("ul");
    children.className = "linguamark-directory-list";
    for (const child of entry.children ?? []) children.append(createDirectoryTreeItem(child, viewer));
    details.append(summary, children);
    item.append(details);
    return item;
  }

  const kind = entry.fileKind ?? "other";
  const button = document.createElement("button");
  button.type = "button";
  button.className = `linguamark-directory-file is-${kind}`;
  button.dataset.directoryPath = entry.path;
  button.dataset.fileKind = kind;
  button.setAttribute("aria-haspopup", "menu");
  button.title = entry.path;
  if (kind === "other") {
    button.setAttribute("aria-disabled", "true");
    button.setAttribute("aria-label", `${entry.name}，不支持打开`);
    button.addEventListener("click", (event) => event.stopPropagation());
  }
  const badge = document.createElement("span");
  badge.className = "linguamark-directory-file-badge";
  badge.setAttribute("aria-hidden", "true");
  badge.textContent = kind === "markdown" ? "MD" : kind === "json" ? "JSON" : kind === "html" ? "HTML" : kind === "pdf" ? "PDF" : kind === "image" ? "IMG" : "FILE";
  const name = document.createElement("span");
  name.className = "linguamark-directory-file-name";
  name.textContent = entry.name;
  button.append(badge, name);
  if (kind !== "other") {
    button.addEventListener("click", () => {
      void openDirectoryEntry(entry.path, kind, viewer);
    });
  }
  item.append(button);
  return item;
}

function showDirectoryContextMenu(event: MouseEvent, target: HTMLElement, viewer: ViewerElements): void {
  const relativePath = target.dataset.directoryPath;
  const root = viewer.directoryRootName;
  if (relativePath === undefined || !root) return;
  const actions: { label: string; action: () => void }[] = [];
  const addButton = (label: string, action: () => void): void => {
    actions.push({ label, action });
  };

  addButton("Copy Relative Path", () => copyToClipboard(relativePath || "."));
  const item: ViewerItem = {
    kind: target.dataset.fileKind !== undefined ? "file" : "directory",
    path: relativePath ? `${root.replace(/\/$/u, "")}/${relativePath}` : root,
  };
  addButton("Copy Name", () => copyToClipboard(item.path.split("/").filter(Boolean).at(-1) ?? item.path));
  const saved = isViewerFavorite(item, viewer);
  const addLabel = item.kind === "directory" ? "Add to Favorite" : "Add to Favorites";
  addButton(saved ? "Remove from Favorites" : addLabel, () => {
    void toggleViewerFavorite(viewer, item);
  });

  if (item.kind === "directory") {
    const folder = target.closest<HTMLDetailsElement>("details");
    if (folder) {
      const setSubtreeExpanded = (expanded: boolean): void => {
        folder.open = expanded;
        for (const descendant of folder.querySelectorAll<HTMLDetailsElement>("details")) descendant.open = expanded;
      };
      addButton("Expand Subtree", () => setSubtreeExpanded(true));
      addButton("Collapse Subtree", () => setSubtreeExpanded(false));
    }
  }
  showContextMenu(event, target, actions);
}

function copyToClipboard(value: string): void {
  void navigator.clipboard.writeText(value).catch((error: unknown) => {
    logWarn("directory", "viewer.clipboard.copy.failed", { errorName: errorName(error) });
    showDirectoryNotice("无法复制到剪贴板");
  });
}

function showContextMenu(
  event: MouseEvent, target: HTMLElement, actions: { label: string; action: () => void }[],
): void {
  closeDirectoryContextMenu?.(false);

  const menu = document.createElement("div");
  menu.className = "linguamark-directory-context-menu";
  menu.dataset.linguamarkUi = "";
  menu.popover = "manual";
  menu.role = "menu";
  menu.setAttribute("aria-label", "项目操作");

  const controller = new AbortController();
  let restoreFocus = true;
  const closeMenu = (shouldRestoreFocus = true): void => {
    restoreFocus = shouldRestoreFocus;
    controller.abort();
    if (closeDirectoryContextMenu === closeMenu) closeDirectoryContextMenu = undefined;
    if (menu.matches(":popover-open")) menu.hidePopover();
    else menu.remove();
  };
  closeDirectoryContextMenu = closeMenu;

  const buttons: HTMLButtonElement[] = [];
  for (const { label, action } of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.role = "menuitem";
    button.textContent = label;
    button.addEventListener("click", () => {
      closeMenu();
      action();
    });
    buttons.push(button);
  }

  menu.addEventListener("keydown", (keyboardEvent) => {
    if (keyboardEvent.key !== "ArrowDown" && keyboardEvent.key !== "ArrowUp") return;
    keyboardEvent.preventDefault();
    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const offset = keyboardEvent.key === "ArrowDown" ? 1 : -1;
    buttons[(currentIndex + offset + buttons.length) % buttons.length].focus();
  });
  menu.addEventListener("toggle", (toggleEvent) => {
    if (toggleEvent.newState !== "closed") return;
    menu.remove();
    if (restoreFocus && target.isConnected) target.focus({ preventScroll: true });
  });
  menu.append(...buttons);

  const targetBounds = target.getBoundingClientRect();
  const fromKeyboard = event.clientX === 0 && event.clientY === 0;
  menu.style.left = `${fromKeyboard ? targetBounds.left : event.clientX}px`;
  menu.style.top = `${fromKeyboard ? targetBounds.bottom : event.clientY}px`;
  document.body.append(menu);
  menu.showPopover();
  document.addEventListener("pointerdown", (pointerEvent) => {
    if (!(pointerEvent.target instanceof Node) || !menu.contains(pointerEvent.target)) closeMenu(false);
  }, { capture: true, signal: controller.signal });
  document.addEventListener("keydown", (keyboardEvent) => {
    if (keyboardEvent.key !== "Escape") return;
    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    closeMenu();
  }, { capture: true, signal: controller.signal });
  const menuBounds = menu.getBoundingClientRect();
  menu.style.left = `${Math.max(8, Math.min(menuBounds.left, innerWidth - menuBounds.width - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(menuBounds.top, innerHeight - menuBounds.height - 8))}px`;
  buttons[0].focus();
}

async function openDirectoryEntry(
  path: string, _kind: DirectoryFileKind, viewer: ViewerElements, hash?: string,
): Promise<void> {
  const root = viewer.directoryRootName;
  if (!root) return;
  await openNativeFile(`${root.replace(/\/$/u, "")}/${path}`, viewer, hash);
}

async function readDirectoryFile(path: string, viewer: ViewerElements): Promise<DirectoryFileContent> {
  const root = viewer.directoryRootName;
  if (!root) throw new Error("请先打开目录");
  return readFile(`${root.replace(/\/$/u, "")}/${path}`);
}

function renderDirectoryMarkdown(file: Extract<DirectoryFileContent, { kind: "markdown" | "html" }>, viewer: ViewerElements, hash?: string): void {
  const { article, customCss } = createArticle(file.text, file.kind);
  viewer.setSidebar("outline", createTableOfContents(article));
  const renderId = ++directoryRenderSequence;
  viewer.content.replaceChildren(article);
  const imagesReady = prepareDirectoryDocument(article, file.path, viewer, renderId);
  viewer.setContentCount(file.kind === "html" ? article.textContent ?? "" : file.text);
  viewer.setPath(file.path);
  replaceCustomStyle(customCss);
  document.title = article.querySelector("h1")?.textContent?.trim() || file.path.split("/").at(-1) || "Markdown";
  resetLocationHash();
  dispatchEvent(new CustomEvent("linguamark:content-replaced"));
  trackDocumentRender(article, imagesReady);
  if (hash) {
    window.setTimeout(() => {
      article.querySelector(`#${CSS.escape(decodeURIComponentSafely(hash))}`)?.scrollIntoView();
    }, 0);
  }
}

function renderJson(file: Extract<DirectoryFileContent, { kind: "json" }>, viewer: ViewerElements): void {
  const article = createJsonArticle(file.text);
  ++directoryRenderSequence;
  ++diagramRenderSequence;
  viewer.content.replaceChildren(article);
  viewer.setSidebar("outline", undefined);
  viewer.setContentCount(file.text);
  viewer.setPath(file.path);
  replaceCustomStyle("");
  document.title = file.path.split("/").at(-1) || "JSON";
  documentRenderReady = Promise.resolve();
  resetLocationHash();
  dispatchEvent(new CustomEvent("linguamark:content-replaced"));
}

function renderPdf(file: Extract<DirectoryFileContent, { kind: "pdf" }>, viewer: ViewerElements): void {
  const { article, ready, dispose } = createPdfArticle(file.base64);
  disposePdf = dispose;
  ++directoryRenderSequence;
  ++diagramRenderSequence;
  viewer.content.replaceChildren(article);
  viewer.setSidebar("outline", undefined);
  viewer.setContentCount("");
  viewer.setPath(file.path);
  replaceCustomStyle("");
  document.title = file.path.split("/").at(-1) || "PDF";
  documentRenderReady = ready;
  resetLocationHash();
  dispatchEvent(new CustomEvent("linguamark:content-replaced"));
}

function renderDirectoryImage(file: Extract<DirectoryFileContent, { kind: "image" }>, viewer: ViewerElements): void {
  directoryRenderSequence += 1;
  diagramRenderSequence += 1;
  viewer.setSidebar("outline", undefined);
  const article = document.createElement("article");
  article.id = "write";
  article.className = "linguamark-directory-image-preview";
  article.dataset.linguamarkIgnore = "";
  const figure = document.createElement("figure");
  const image = document.createElement("img");
  image.src = file.dataUrl;
  image.alt = file.path.split("/").at(-1) ?? "图片";
  const caption = document.createElement("figcaption");
  caption.textContent = file.path;
  figure.append(image, caption);
  article.append(figure);
  viewer.content.replaceChildren(article);
  viewer.setContentCount("");
  viewer.setPath(file.path);
  replaceCustomStyle("");
  document.title = image.alt;
  documentRenderReady = image.decode().catch(() => undefined);
  resetLocationHash();
  dispatchEvent(new CustomEvent("linguamark:content-replaced"));
}

function trackDocumentRender(article: HTMLElement, imagesReady: Promise<void> = Promise.resolve()): void {
  documentRenderReady = Promise.all([imagesReady, renderDiagrams(article), document.fonts.ready])
    .then(() => undefined)
    .catch((error: unknown) => {
      logWarn("content", "markdown.enhancements.failed", { errorName: errorName(error) });
    });
}

function prepareDirectoryDocument(article: HTMLElement, currentPath: string, viewer: ViewerElements, renderId: number): Promise<void> {
  const imagesReady: Promise<void>[] = [];
  for (const image of article.querySelectorAll<HTMLImageElement>("img[src]")) {
    const reference = image.getAttribute("src");
    if (!reference || reference.startsWith("data:")) continue;
    if (isExternalReference(reference) || reference.startsWith("#")) {
      image.removeAttribute("src");
      image.removeAttribute("srcset");
      image.title = "不自动加载远程图片";
      continue;
    }
    const resolved = resolveDirectoryReference(currentPath, reference);
    image.removeAttribute("srcset");
    image.removeAttribute("src");
    if (!resolved || directoryFileKind(resolved.path) !== "image") {
      image.classList.add("linguamark-directory-image-error");
      continue;
    }
    image.classList.add("linguamark-directory-image-loading");
    imagesReady.push(loadDirectoryImage(image, resolved.path, article, viewer, renderId));
  }

  for (const anchor of article.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    const reference = anchor.getAttribute("href");
    if (!reference || reference.startsWith("#") || isExternalReference(reference)) continue;
    const resolved = resolveDirectoryReference(currentPath, reference);
    const kind = resolved ? directoryFileKind(resolved.path) : "other";
    if (!resolved || kind === "other") {
      anchor.removeAttribute("href");
      anchor.classList.add("linguamark-directory-link-disabled");
      anchor.setAttribute("aria-disabled", "true");
      continue;
    }
    anchor.href = "#";
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      void openDirectoryEntry(resolved.path, kind, viewer, resolved.hash);
    });
  }
  return Promise.all(imagesReady).then(() => undefined);
}

async function loadDirectoryImage(
  image: HTMLImageElement,
  path: string,
  article: HTMLElement,
  viewer: ViewerElements,
  renderId: number,
): Promise<void> {
  try {
    const cacheKey = `${viewer.directoryRootName}/${path}`;
    let dataUrl = directoryImageCache.get(cacheKey);
    if (!dataUrl) {
      const file = await readDirectoryFile(path, viewer);
      if (file.kind !== "image") throw new Error("相对资源不是图片");
      dataUrl = file.dataUrl;
      if (renderId !== directoryRenderSequence || !article.isConnected) return;
      directoryImageCache.set(cacheKey, dataUrl);
    }
    if (renderId !== directoryRenderSequence || !article.isConnected) return;
    image.src = dataUrl;
    await image.decode();
    image.classList.remove("linguamark-directory-image-loading");
  } catch (error: unknown) {
    if (renderId !== directoryRenderSequence) return;
    image.classList.remove("linguamark-directory-image-loading");
    image.classList.add("linguamark-directory-image-error");
    image.title = error instanceof Error ? error.message : "无法加载图片";
  }
}

function resolveDirectoryReference(currentPath: string, reference: string): ResolvedDirectoryReference | undefined {
  const hashIndex = reference.indexOf("#");
  const hash = hashIndex >= 0 ? reference.slice(hashIndex + 1) : undefined;
  const beforeHash = hashIndex >= 0 ? reference.slice(0, hashIndex) : reference;
  const pathValue = beforeHash.split("?", 1)[0];
  if (!pathValue) return undefined;

  const decoded = decodeURIComponentSafely(pathValue).replaceAll("\\", "/");
  const parts = decoded.startsWith("/") ? [] : currentPath.split("/").slice(0, -1);
  for (const part of decoded.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (parts.length === 0) return undefined;
      parts.pop();
    } else if (part.includes("\0")) {
      return undefined;
    } else {
      parts.push(part);
    }
  }
  return parts.length > 0 ? { path: parts.join("/"), ...(hash ? { hash } : {}) } : undefined;
}

function isExternalReference(reference: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/iu.test(reference);
}

function currentDirectoryPath(viewer: ViewerElements, sidebar: HTMLElement): string {
  if (viewer.currentItem?.kind !== "file" || !viewer.directoryRootName) return "";
  const prefix = `${viewer.directoryRootName.replace(/\/$/u, "")}/`;
  if (!viewer.currentItem.path.startsWith(prefix)) return "";
  const relative = viewer.currentItem.path.slice(prefix.length);
  return [...sidebar.querySelectorAll<HTMLElement>("[data-directory-path]")]
    .some((element) => element.dataset.directoryPath === relative) ? relative : "";
}

function setActiveDirectoryPath(path: string, scope: ParentNode = document): void {
  let activeFile: HTMLButtonElement | undefined;
  for (const button of scope.querySelectorAll<HTMLButtonElement>(".linguamark-directory-file[data-directory-path]")) {
    const isActive = button.dataset.directoryPath === path;
    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
      activeFile = button;
    } else {
      button.removeAttribute("aria-current");
    }
  }
  for (const button of scope.querySelectorAll<HTMLButtonElement>(".linguamark-directory-focus-button")) {
    button.disabled = !activeFile;
  }
  if (!activeFile) return;
  for (let folder = activeFile.closest("details"); folder; folder = folder.parentElement?.closest("details") ?? null) {
    folder.open = true;
  }
  if (activeFile.isConnected) {
    activeFile.scrollIntoView({ block: "center", inline: "nearest" });
    activeFile.focus({ preventScroll: true });
  }
}

function resetLocationHash(): void {
  if (!location.hash) return;
  try {
    history.replaceState(null, "", location.href.slice(0, -location.hash.length));
  } catch {
    location.hash = "";
  }
}

function showDirectoryNotice(message: string): void {
  clearDirectoryNotice();
  const notice = document.createElement("aside");
  notice.className = "linguamark-markdown-error linguamark-directory-notice";
  notice.dataset.linguamarkUi = "";
  notice.role = "status";
  notice.textContent = message;
  document.body.append(notice);
}

function clearDirectoryNotice(): void {
  document.querySelector(".linguamark-directory-notice")?.remove();
}

function decodeURIComponentSafely(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function headingLevel(heading: HTMLHeadingElement): number {
  return Number.parseInt(heading.tagName.slice(1), 10);
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replaceAll(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replaceAll(/\s+/gu, "-")
    .replaceAll(/-+/gu, "-");
}

function escapeHtml(value: string): string {
  return value.replaceAll(/[&<>"']/gu, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]!);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : "UnknownError";
}
