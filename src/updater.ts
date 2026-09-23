import { invoke } from "@tauri-apps/api/core";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { errorMessage } from "./platform.ts";

export function createUpdaterControls(): HTMLElement {
  const root = document.createElement("div");
  root.className = "reader-updater";
  // Release notes and remote error messages are rendered as text, never HTML.
  root.innerHTML = `
    <div class="reader-updater-actions">
      <button type="button" class="reader-updater-check">检查更新</button>
      <button type="button" class="reader-updater-install" hidden>下载、安装并重启</button>
    </div>
    <p class="reader-settings-status" role="status" aria-live="polite">仅在你点击时检查更新，安装完成后会重启应用。</p>
    <progress aria-label="更新下载进度" hidden></progress>
    <p class="reader-updater-progress" hidden></p>
    <pre class="reader-updater-notes" aria-label="更新说明" tabindex="0" hidden></pre>`;
  const checkButton = root.querySelector<HTMLButtonElement>(".reader-updater-check")!;
  const installButton = root.querySelector<HTMLButtonElement>(".reader-updater-install")!;
  const status = root.querySelector<HTMLElement>("[role=status]")!;
  const progress = root.querySelector<HTMLProgressElement>("progress")!;
  const progressText = root.querySelector<HTMLElement>(".reader-updater-progress")!;
  const notes = root.querySelector<HTMLElement>(".reader-updater-notes")!;
  let update: Update | null = null;
  let busy = false;
  let installed = false;

  const setBusy = (value: boolean): void => {
    busy = value;
    checkButton.disabled = value || installed;
    installButton.disabled = value;
  };
  const showStatus = (message: string, error = false): void => {
    status.textContent = message;
    status.classList.toggle("is-error", error);
  };
  const releaseUpdate = async (): Promise<void> => {
    const previous = update;
    update = null;
    if (previous) {
      // Cleanup failure must not cause a successful installation to be retried.
      await previous.close().catch((error: unknown) => console.warn("Update resource cleanup failed", error));
    }
  };

  checkButton.addEventListener("click", async () => {
    if (busy || installed) return;
    setBusy(true);
    installButton.hidden = true;
    installButton.textContent = "下载、安装并重启";
    notes.hidden = true;
    notes.textContent = "";
    progress.hidden = true;
    progressText.hidden = true;
    showStatus("正在检查更新…");
    try {
      await releaseUpdate();
      if (!await invoke<boolean>("updater_configured")) {
        showStatus("此构建尚未配置更新签名公钥或更新地址，暂时无法检查更新。", true);
        return;
      }
      update = await check({ timeout: 30_000 });
      checkButton.textContent = "重新检查";
      if (!update) {
        showStatus("当前已是最新版本。");
        return;
      }
      showStatus(`发现新版本 ${update.version}。点击“下载、安装并重启”确认更新。`);
      notes.textContent = update.body || "此版本未提供更新说明。";
      notes.hidden = false;
      installButton.hidden = false;
    } catch (error) {
      showStatus(`检查更新失败：${errorMessage(error)}`, true);
      checkButton.textContent = "重试检查";
    } finally {
      setBusy(false);
    }
  });

  installButton.addEventListener("click", async () => {
    if (busy || (!update && !installed)) return;
    setBusy(true);
    try {
      if (!installed && update) {
        let downloaded = 0;
        let total = 0;
        progress.removeAttribute("value");
        progress.hidden = false;
        progressText.hidden = false;
        progressText.textContent = "正在连接下载服务器…";
        showStatus("正在下载更新，请勿退出应用…");
        await update.downloadAndInstall((event) => {
          if (event.event === "Started") {
            total = event.data.contentLength ?? 0;
            downloaded = 0;
          } else if (event.event === "Progress") {
            downloaded += event.data.chunkLength;
            if (total > 0) {
              progress.max = total;
              progress.value = Math.min(downloaded, total);
            }
            const size = `${(downloaded / 1024 / 1024).toFixed(1)} MiB`;
            progressText.textContent = total > 0
              ? `已下载 ${size} / ${(total / 1024 / 1024).toFixed(1)} MiB`
              : `已下载 ${size}`;
          } else {
            progress.hidden = true;
            progressText.hidden = true;
            showStatus("下载完成，正在验证签名并安装…");
          }
        }, { timeout: 300_000 });
        installed = true;
        await releaseUpdate();
      }
      showStatus("更新已安装，正在重启…");
      installButton.textContent = "重启应用";
      await relaunch();
    } catch (error) {
      progress.hidden = true;
      progressText.hidden = true;
      if (installed) {
        showStatus(`更新已安装，但重启失败。请重试重启或退出后重新打开应用：${errorMessage(error)}`, true);
        installButton.textContent = "重试重启";
      } else {
        showStatus(`更新未完成，可重试或重新检查：${errorMessage(error)}`, true);
        installButton.textContent = "重试下载、安装并重启";
      }
    } finally {
      setBusy(false);
    }
  });
  return root;
}
