declare const __APP_NAME__: string;
declare const __APP_VERSION__: string;

type ReaderFont = "theme" | "system" | "serif";
export interface ReaderSettings {
  font: ReaderFont;
  fontSize: number;
  lineHeight: number;
  readingWidth: "fixed" | "full";
  restoreSession: boolean;
  reloadAnimation: boolean;
}

const SETTINGS_KEY = "linguamark-reader-settings-v1";
const defaults: Readonly<ReaderSettings> = {
  font: "theme", fontSize: 18, lineHeight: 1.78,
  readingWidth: "fixed", restoreSession: true, reloadAnimation: false,
};
const fonts: Record<ReaderFont, string> = {
  theme: "var(--font-body)",
  system: 'system-ui, -apple-system, "PingFang SC", sans-serif',
  serif: '"Songti SC", "Noto Serif CJK SC", Georgia, serif',
};
const listeners = new Set<(settings: Readonly<ReaderSettings>) => void>();
let loadWarning = "";
let settings = loadSettings();

function bounded(value: unknown, fallback: number, minimum: number, maximum: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value)) : fallback;
}

function normalize(value: unknown): ReaderSettings {
  const data = typeof value === "object" && value !== null ? value as Partial<ReaderSettings> : {};
  return {
    font: data.font === "system" || data.font === "serif" ? data.font : "theme",
    fontSize: Math.round(bounded(data.fontSize, defaults.fontSize, 14, 28)),
    lineHeight: Math.round(bounded(data.lineHeight, defaults.lineHeight, 1.4, 2.4) * 100) / 100,
    readingWidth: data.readingWidth === "full" ? "full" : "fixed",
    restoreSession: typeof data.restoreSession === "boolean" ? data.restoreSession : defaults.restoreSession,
    reloadAnimation: typeof data.reloadAnimation === "boolean" ? data.reloadAnimation : defaults.reloadAnimation,
  };
}

function loadSettings(): ReaderSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored !== null) return normalize(JSON.parse(stored));
    return { ...defaults, reloadAnimation: sessionStorage.getItem("markdownViewerReloadAnimation") === "true" };
  } catch {
    loadWarning = "无法读取原设置，已使用默认值；修改任一选项后将尝试重新保存。";
    return { ...defaults };
  }
}

export function getSettings(): Readonly<ReaderSettings> {
  return settings;
}

export function subscribeSettings(listener: (settings: Readonly<ReaderSettings>) => void): void {
  listeners.add(listener);
  listener(settings);
}

export function updateSettings(changes: Partial<ReaderSettings>): string | undefined {
  const next = normalize({ ...settings, ...changes });
  try {
    // Commit before notifying: the UI never claims an unsaved preference survived a failed write.
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    return "设置保存失败，已保留之前的配置。请检查本机存储后重试。";
  }
  settings = next;
  loadWarning = "";
  for (const listener of listeners) listener(settings);
  return undefined;
}

export function applyTypography(value: Readonly<ReaderSettings>): void {
  const style = document.documentElement.style;
  style.setProperty("--reader-font", fonts[value.font]);
  style.setProperty("--reader-heading-font", value.font === "theme" ? "var(--font-heading)" : fonts[value.font]);
  style.setProperty("--reader-font-size", `${value.fontSize}px`);
  style.setProperty("--reader-line-height", String(value.lineHeight));
}

export function createSettingsPage(): { dialog: HTMLDialogElement; open: () => void } {
  const dialog = document.createElement("dialog");
  dialog.id = "reader-settings";
  dialog.className = "reader-settings";
  dialog.dataset.linguamarkUi = "";
  dialog.setAttribute("aria-labelledby", "reader-settings-title");
  // Static application markup only. Document text and persisted values never enter innerHTML.
  dialog.innerHTML = `
    <header class="reader-settings-header">
      <h2 id="reader-settings-title">设置</h2>
      <button type="button" class="reader-settings-close" aria-label="关闭设置">×</button>
    </header>
    <div class="reader-settings-tabs" role="tablist" aria-label="设置分类">
      <button type="button" role="tab" id="settings-basic-tab" aria-controls="settings-basic" aria-selected="true">Basic <span>基础</span></button>
      <button type="button" role="tab" id="settings-about-tab" aria-controls="settings-about" aria-selected="false" tabindex="-1">About <span>关于</span></button>
    </div>
    <section id="settings-basic" role="tabpanel" aria-labelledby="settings-basic-tab">
      <div class="reader-settings-row">
        <label for="reader-font">阅读字体</label>
        <select id="reader-font">
          <option value="theme">主题默认（霞鹜文楷优先）</option>
          <option value="system">系统无衬线</option>
          <option value="serif">衬线字体</option>
        </select>
      </div>
      <div class="reader-settings-row">
        <label for="reader-font-size">正文字号</label>
        <div class="reader-settings-range"><input id="reader-font-size" type="range" min="14" max="28" step="1"><output for="reader-font-size"></output></div>
      </div>
      <div class="reader-settings-row">
        <label for="reader-line-height">正文行距</label>
        <div class="reader-settings-range"><input id="reader-line-height" type="range" min="1.4" max="2.4" step="0.01"><output for="reader-line-height"></output></div>
      </div>
      <div class="reader-settings-row">
        <label for="reader-width">默认阅读宽度</label>
        <select id="reader-width"><option value="fixed">固定宽度</option><option value="full">整屏宽度</option></select>
      </div>
      <label class="reader-settings-row reader-settings-toggle" for="reader-restore">
        <span>启动时恢复上次阅读<small>下次启动生效，不会清除收藏或最近浏览。</small></span>
        <input id="reader-restore" type="checkbox" role="switch">
      </label>
      <label class="reader-settings-row reader-settings-toggle" for="reader-animation">
        <span>重载动画<small>恢复阅读位置时平滑滚动，遵循系统“减少动态效果”。</small></span>
        <input id="reader-animation" type="checkbox" role="switch">
      </label>
      <div class="reader-settings-preview" aria-label="阅读样式预览">让阅读回到文字本身。<br>Read at your own pace.</div>
      <p class="reader-settings-status" role="status" aria-live="polite"></p>
    </section>
    <section id="settings-about" role="tabpanel" aria-labelledby="settings-about-tab" tabindex="0" hidden>
      <div class="reader-settings-about-mark" aria-hidden="true">MD</div>
      <h3 class="reader-settings-app-name"></h3>
      <p class="reader-settings-version"></p>
      <p>专注本地 Markdown 阅读，支持目录浏览、公式、图表与收藏。</p>
      <p class="reader-settings-muted">基于 Tauri · 内容在本机渲染<br>此版本不包含 AI 分析。</p>
    </section>`;

  const font = dialog.querySelector<HTMLSelectElement>("#reader-font")!;
  const fontSize = dialog.querySelector<HTMLInputElement>("#reader-font-size")!;
  const lineHeight = dialog.querySelector<HTMLInputElement>("#reader-line-height")!;
  const width = dialog.querySelector<HTMLSelectElement>("#reader-width")!;
  const restore = dialog.querySelector<HTMLInputElement>("#reader-restore")!;
  const animation = dialog.querySelector<HTMLInputElement>("#reader-animation")!;
  const status = dialog.querySelector<HTMLElement>(".reader-settings-status")!;
  const tabs = [...dialog.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = [...dialog.querySelectorAll<HTMLElement>('[role="tabpanel"]')];

  dialog.querySelector(".reader-settings-app-name")!.textContent = __APP_NAME__;
  dialog.querySelector(".reader-settings-version")!.textContent = `版本 ${__APP_VERSION__}`;
  const sync = (value: Readonly<ReaderSettings>): void => {
    font.value = value.font;
    fontSize.value = String(value.fontSize);
    lineHeight.value = String(value.lineHeight);
    width.value = value.readingWidth;
    restore.checked = value.restoreSession;
    animation.checked = value.reloadAnimation;
    dialog.querySelector('output[for="reader-font-size"]')!.textContent = `${value.fontSize} px`;
    dialog.querySelector('output[for="reader-line-height"]')!.textContent = `${value.lineHeight.toFixed(2)} 倍`;
  };
  subscribeSettings(sync);
  const change = (patch: Partial<ReaderSettings>): void => {
    const error = updateSettings(patch);
    if (error) sync(getSettings());
    status.textContent = error ?? "已保存。显示偏好即时生效，启动偏好下次启动生效。";
    status.classList.toggle("is-error", Boolean(error));
  };
  font.addEventListener("change", () => change({ font: font.value as ReaderFont }));
  fontSize.addEventListener("input", () => change({ fontSize: fontSize.valueAsNumber }));
  lineHeight.addEventListener("input", () => change({ lineHeight: lineHeight.valueAsNumber }));
  width.addEventListener("change", () => change({ readingWidth: width.value as ReaderSettings["readingWidth"] }));
  restore.addEventListener("change", () => change({ restoreSession: restore.checked }));
  animation.addEventListener("change", () => change({ reloadAnimation: animation.checked }));

  const selectTab = (index: number, focus: boolean): void => {
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(index, false));
    tab.addEventListener("keydown", (event) => {
      let next: number;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(next, true);
    });
  });
  dialog.querySelector(".reader-settings-close")!.addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dialog.close();
    }
  });

  return {
    dialog,
    open() {
      sync(getSettings());
      status.textContent = loadWarning || "设置自动保存在本机。字体使用已安装字体及系统回退。";
      status.classList.toggle("is-error", Boolean(loadWarning));
      if (!dialog.open) dialog.showModal();
      tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.focus();
    },
  };
}
