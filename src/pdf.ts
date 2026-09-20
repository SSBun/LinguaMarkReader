import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";

export function createPdfArticle(base64: string): { article: HTMLElement; ready: Promise<void>; dispose: () => void } {
  const article = document.createElement("article");
  article.id = "write";
  article.className = "linguamark-pdf";
  const toolbar = document.createElement("div");
  toolbar.className = "linguamark-pdf-toolbar";
  toolbar.setAttribute("role", "group");
  toolbar.setAttribute("aria-label", "PDF 阅读模式、分页与缩放");
  const button = (label: string, arrow: string): HTMLButtonElement => {
    const element = document.createElement("button");
    element.type = "button";
    element.className = "linguamark-markdown-directory-button";
    element.textContent = arrow;
    element.title = label;
    element.setAttribute("aria-label", label);
    return element;
  };
  const previous = button("上一页", "←");
  const next = button("下一页", "→");
  const pageInput = document.createElement("input");
  pageInput.type = "number";
  pageInput.min = "1";
  pageInput.value = "1";
  pageInput.setAttribute("aria-label", "PDF 页码");
  const total = document.createElement("span");
  total.setAttribute("aria-hidden", "true");
  const mode = document.createElement("select");
  mode.setAttribute("aria-label", "PDF 阅读模式");
  mode.add(new Option("纵向连续滚动", "vertical"));
  mode.add(new Option("横向单页翻页", "horizontal"));
  const zoom = document.createElement("select");
  zoom.setAttribute("aria-label", "PDF 缩放");
  for (const [value, label] of [["0", "适合宽度"], ["0.75", "75%"], ["1", "100%"], ["1.5", "150%"], ["2", "200%"]]) {
    zoom.add(new Option(label, value));
  }
  const status = document.createElement("span");
  status.setAttribute("role", "status");
  status.textContent = "正在加载 PDF…";
  toolbar.append(previous, pageInput, total, next, mode, zoom, status);
  const viewport = document.createElement("div");
  viewport.className = "linguamark-pdf-viewport";
  viewport.tabIndex = 0;
  viewport.setAttribute("role", "region");
  viewport.setAttribute("aria-label", "PDF 页面阅读区");
  const text = document.createElement("details");
  text.className = "linguamark-pdf-text";
  const summary = document.createElement("summary");
  summary.textContent = "当前页文本（可复制与搜索）";
  const textContent = document.createElement("pre");
  text.append(summary, textContent);
  article.append(toolbar, viewport, text);

  let disposed = false;
  let loading: PDFDocumentLoadingTask | undefined;
  let pdf: PDFDocumentProxy | undefined;
  let rendering: RenderTask | undefined;
  let pageNumber = 1;
  let generation = 0;
  let pumping = false;
  let resizeTimer: number | undefined;
  let scrollFrame = 0;
  let positionedScrollTop: number | undefined;
  let initialSize = { width: 612, height: 792 };
  const sizes = new Map<number, { width: number; height: number }>();
  const slots = new Map<number, HTMLElement>();
  const nearby = new Set<number>();
  const pending = new Set<number>();
  const rendered = new Set<number>();
  const pageTexts = new Map<number, string>();
  const horizontal = (): boolean => mode.value === "horizontal";
  const updateControls = (): void => {
    previous.disabled = !pdf || pageNumber <= 1;
    next.disabled = !pdf || pageNumber >= pdf.numPages;
    pageInput.disabled = zoom.disabled = mode.disabled = !pdf;
    pageInput.value = String(pageNumber);
    if (pdf) status.textContent = `第 ${pageNumber} / ${pdf.numPages} 页`;
    textContent.textContent = pageTexts.get(pageNumber) ?? "正在提取当前页文本…";
  };
  updateControls();

  const dimensions = (number: number): { width: number; height: number; scale: number } => {
    const size = sizes.get(number) ?? initialSize;
    const fitWidth = Math.max(1, viewport.clientWidth - 24) / size.width;
    const fitHeight = Math.max(1, viewport.clientHeight - 24) / size.height;
    const scale = Number(zoom.value) || Math.min(2, fitWidth, horizontal() ? fitHeight : Infinity);
    return { width: size.width * scale, height: size.height * scale, scale };
  };
  const sizeSlot = (number: number, slot: HTMLElement): void => {
    const { width, height } = dimensions(number);
    slot.style.width = `${width}px`;
    slot.style.height = `${height}px`;
  };
  const placeholder = (number: number, slot: HTMLElement): void => {
    const label = document.createElement("span");
    label.className = "linguamark-pdf-placeholder";
    label.textContent = `第 ${number} 页`;
    slot.replaceChildren(label);
  };
  const evict = (number: number): void => {
    const slot = slots.get(number);
    for (const canvas of slot?.querySelectorAll("canvas") ?? []) {
      canvas.width = canvas.height = 0;
    }
    if (slot) placeholder(number, slot);
    rendered.delete(number);
    pageTexts.delete(number);
    pending.delete(number);
  };

  const renderPage = async (number: number, token: number): Promise<void> => {
    const slot = slots.get(number);
    if (!pdf || !slot) return;
    const stale = (): boolean => disposed || token !== generation;
    try {
      const page = await pdf.getPage(number);
      if (stale()) return;
      try {
        const natural = page.getViewport({ scale: 1 });
        sizes.set(number, { width: natural.width, height: natural.height });
        // Keep the visible page anchored when an earlier mixed-size page is measured.
        const oldHeight = slot.offsetHeight;
        const above = slot.offsetTop + oldHeight < viewport.scrollTop;
        sizeSlot(number, slot);
        if (above) {
          viewport.scrollTop += slot.offsetHeight - oldHeight;
          if (positionedScrollTop !== undefined) positionedScrollTop = viewport.scrollTop;
        }
        const view = page.getViewport({ scale: dimensions(number).scale });
        const ratio = Math.min(window.devicePixelRatio || 1, 2, 4096 / view.width, 4096 / view.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(view.width * ratio));
        canvas.height = Math.max(1, Math.floor(view.height * ratio));
        canvas.style.width = `${view.width}px`;
        canvas.style.height = `${view.height}px`;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", `PDF 第 ${number} 页，共 ${pdf.numPages} 页`);
        // Render off-DOM so scrolling away can release only completed canvases.
        rendering = page.render({ canvas, viewport: view, transform: [ratio, 0, 0, ratio, 0, 0] });
        await rendering.promise;
        if (stale()) return;
        if (!nearby.has(number)) {
          canvas.width = canvas.height = 0;
          return;
        }
        slot.replaceChildren(canvas);
        rendered.add(number);
        try {
          // WebKit supports stream readers before ReadableStream async iteration.
          const reader: ReadableStreamDefaultReader<Awaited<ReturnType<typeof page.getTextContent>>> = page.streamTextContent().getReader();
          const chunks: string[] = [];
          try {
            while (!stale()) {
              const { value, done } = await reader.read();
              if (done) break;
              chunks.push(value.items.map((item) => "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "").join(""));
            }
          } finally {
            reader.releaseLock();
          }
          if (!stale() && nearby.has(number)) pageTexts.set(number, chunks.join("") || "此页没有可提取的文本（可能是扫描件）。");
        } catch {
          if (!stale() && nearby.has(number)) pageTexts.set(number, "无法提取此页文本；仍可阅读页面。");
        }
        if (!stale() && number === pageNumber) updateControls();
      } finally {
        page.cleanup();
      }
    } catch {
      if (!stale() && nearby.has(number)) {
        slot.textContent = `第 ${number} 页渲染失败，请重新导入或切换阅读模式重试。`;
        rendered.add(number);
        pageTexts.set(number, "此页渲染失败。");
        if (number === pageNumber) updateControls();
      }
    } finally {
      rendering = undefined;
    }
  };
  const pump = async (): Promise<void> => {
    if (pumping || disposed) return;
    pumping = true;
    try {
      while (pending.size && !disposed) {
        const number = pending.has(pageNumber) ? pageNumber : pending.values().next().value!;
        pending.delete(number);
        if (nearby.has(number) && !rendered.has(number)) await renderPage(number, generation);
      }
    } finally {
      pumping = false;
    }
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const number = Number((entry.target as HTMLElement).dataset.page);
      if (slots.get(number) !== entry.target) continue;
      if (entry.isIntersecting) {
        nearby.add(number);
        if (!rendered.has(number)) pending.add(number);
      } else {
        nearby.delete(number);
        evict(number);
      }
    }
    void pump();
  }, { root: viewport, rootMargin: "600px 0px" });

  const positionPage = (): void => {
    viewport.scrollTop = horizontal() ? 0 : (slots.get(pageNumber)?.offsetTop ?? 12) - 12;
    // Retain explicit selection even when the browser clamps a final-page jump.
    // A real change in scroll position releases this anchor for manual reading.
    positionedScrollTop = viewport.scrollTop;
  };
  const rebuild = async (): Promise<void> => {
    if (!pdf || disposed) return;
    ++generation;
    rendering?.cancel();
    observer.disconnect();
    for (const number of slots.keys()) evict(number);
    slots.clear();
    nearby.clear();
    pending.clear();
    viewport.replaceChildren();
    article.dataset.pdfMode = mode.value;
    zoom.options[0].text = horizontal() ? "适合页面" : "适合宽度";
    const start = horizontal() ? pageNumber : 1;
    const end = horizontal() ? pageNumber : pdf.numPages;
    const fragment = document.createDocumentFragment();
    for (let number = start; number <= end; number++) {
      const slot = document.createElement("div");
      slot.className = "linguamark-pdf-page";
      slot.dataset.page = String(number);
      slots.set(number, slot);
      sizeSlot(number, slot);
      placeholder(number, slot);
      fragment.append(slot);
    }
    viewport.append(fragment);
    positionPage();
    viewport.scrollLeft = 0;
    nearby.add(pageNumber);
    pending.add(pageNumber);
    for (const slot of slots.values()) observer.observe(slot);
    updateControls();
    await pump();
  };
  const go = (number: number): void => {
    if (!pdf || !Number.isInteger(number) || number < 1 || number > pdf.numPages) {
      pageInput.value = String(pageNumber);
      return;
    }
    pageNumber = number;
    updateControls();
    if (horizontal()) void rebuild();
    else {
      positionPage();
      nearby.add(number);
      pending.add(number);
      void pump();
    }
  };
  previous.addEventListener("click", () => go(pageNumber - 1));
  next.addEventListener("click", () => go(pageNumber + 1));
  pageInput.addEventListener("change", () => go(Number(pageInput.value)));
  mode.addEventListener("change", () => { void rebuild(); });
  zoom.addEventListener("change", () => { void rebuild(); });
  viewport.addEventListener("scroll", () => {
    if (horizontal() || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (disposed || horizontal()) return;
      if (positionedScrollTop !== undefined && Math.abs(viewport.scrollTop - positionedScrollTop) < 1) return;
      positionedScrollTop = undefined;
      // Use the leading reading edge, not the midpoint (which may be several pages ahead).
      const leading = viewport.scrollTop + 12;
      let closest = pageNumber;
      let distance = Infinity;
      for (const [number, slot] of slots) {
        const delta = Math.max(slot.offsetTop - leading, leading - slot.offsetTop - slot.offsetHeight, 0);
        if (delta < distance) { closest = number; distance = delta; }
      }
      if (viewport.scrollTop > 0 && viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1) {
        closest = pdf?.numPages ?? closest;
      }
      if (closest !== pageNumber) {
        pageNumber = closest;
        updateControls();
      }
    });
  });
  let lastWidth = 0;
  let lastHeight = 0;
  const resizeObserver = new ResizeObserver(() => {
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    if (width === lastWidth && height === lastHeight) return;
    const needsLayout = lastWidth > 0 && (width !== lastWidth || horizontal());
    lastWidth = width;
    lastHeight = height;
    clearTimeout(resizeTimer);
    if (needsLayout && pdf && zoom.value === "0") resizeTimer = window.setTimeout(() => { void rebuild(); }, 120);
  });
  resizeObserver.observe(viewport);

  const ready = (async () => {
    try {
      const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist/legacy/build/pdf.mjs");
      if (disposed) return;
      const asset = (path: string): string => new URL(`pdfjs/${path}`, document.baseURI).href;
      GlobalWorkerOptions.workerSrc = asset("pdf.worker.min.mjs");
      const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
      loading = getDocument({
        data: bytes,
        cMapUrl: asset("cmaps/"),
        cMapPacked: true,
        standardFontDataUrl: asset("standard_fonts/"),
        wasmUrl: asset("wasm/"),
        iccUrl: asset("iccs/"),
        useWorkerFetch: false,
        enableXfa: false,
      });
      const loaded = await loading.promise;
      if (disposed) return;
      const first = await loaded.getPage(1);
      if (disposed) return;
      const size = first.getViewport({ scale: 1 });
      initialSize = { width: size.width, height: size.height };
      sizes.set(1, initialSize);
      first.cleanup();
      pdf = loaded;
      total.textContent = `/ ${pdf.numPages}`;
      pageInput.max = String(pdf.numPages);
      await rebuild();
    } catch (error: unknown) {
      if (disposed) return;
      status.textContent = error instanceof Error && error.name === "PasswordException"
        ? "此 PDF 需要密码，请先解锁文件后重新导入。"
        : "无法打开 PDF：文件可能已损坏或格式不受支持。";
      textContent.textContent = "没有可用的页面文本。";
    }
  })();
  return {
    article,
    ready,
    dispose: () => {
      disposed = true;
      ++generation;
      clearTimeout(resizeTimer);
      cancelAnimationFrame(scrollFrame);
      observer.disconnect();
      resizeObserver.disconnect();
      rendering?.cancel();
      for (const number of slots.keys()) evict(number);
      void loading?.destroy().catch(() => undefined);
    },
  };
}
