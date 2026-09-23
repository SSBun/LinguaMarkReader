import { access, copyFile, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));
if (process.platform !== "darwin" || !["arm64", "x64"].includes(process.arch)) {
  throw new Error("此发布命令仅支持在 Apple Silicon 或 Intel Mac 上构建当前架构的更新包。");
}
const app = JSON.parse(await readFile("src-tauri/tauri.conf.json", "utf8"));
if (!app.plugins?.updater?.pubkey?.trim()) {
  throw new Error("请先在 Tauri 配置中填写真实的 Updater 公钥；不会使用占位公钥构建更新包。");
}
const signingKey = process.env.TAURI_SIGNING_PRIVATE_KEY
  || join(homedir(), ".config", "LinguaMarkReader", "updater.key");
if (!process.env.TAURI_SIGNING_PRIVATE_KEY) {
  await access(signingKey).catch(() => {
    throw new Error("未找到本机更新密钥。请恢复备份，或通过 TAURI_SIGNING_PRIVATE_KEY 指定密钥；不要为已有客户端重新生成密钥。");
  });
}
if (!/^\d+\.\d+\.\d+$/.test(app.version)) {
  throw new Error("此命令面向稳定版发布，版本号必须为 major.minor.patch。");
}
const arch = process.arch === "arm64" ? "aarch64" : "x86_64";
const target = `${arch}-apple-darwin`;
const targetDirectory = fileURLToPath(new URL("../src-tauri/target", import.meta.url));
const result = spawnSync(process.execPath, [
  "node_modules/@tauri-apps/cli/tauri.js", "build", "--bundles", "app",
  "--target", target, "--config", JSON.stringify({ bundle: { createUpdaterArtifacts: true } }),
], {
  stdio: "inherit",
  env: {
    ...process.env,
    CARGO_TARGET_DIR: targetDirectory,
    TAURI_SIGNING_PRIVATE_KEY: signingKey,
    TAURI_SIGNING_PRIVATE_KEY_PASSWORD: process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD ?? "",
  },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

const directory = `${targetDirectory}/${target}/release/bundle/macos`;
const source = `${app.productName}.app.tar.gz`;
const filename = `LinguaMark-Reader_${app.version}_${arch}.app.tar.gz`;
const signature = (await readFile(`${directory}/${source}.sig`, "utf8")).trim();
if (!signature) throw new Error("构建未生成有效的更新签名。");
const verification = spawnSync("cargo", [
  "run", "--manifest-path", "src-tauri/Cargo.toml", "--locked", "--release",
  "--target", target, "--features", "custom-protocol", "--example", "verify_update", "--",
  "src-tauri/tauri.conf.json", `${directory}/${source}`, `${directory}/${source}.sig`,
], { stdio: "inherit", env: { ...process.env, CARGO_TARGET_DIR: targetDirectory } });
if (verification.error) throw verification.error;
if (verification.status !== 0) process.exit(verification.status ?? 1);
await copyFile(`${directory}/${source}`, `${directory}/${filename}`);
await copyFile(`${directory}/${source}.sig`, `${directory}/${filename}.sig`);
const changelog = await readFile("CHANGELOG.md", "utf8");
const releaseSection = changelog.split(`## [${app.version}]`)[1];
if (!releaseSection) throw new Error("CHANGELOG 缺少当前版本的发布说明。");
const notes = releaseSection.slice(releaseSection.indexOf("\n") + 1).split("\n## [")[0].trim();
const manifest = {
  version: app.version,
  notes,
  pub_date: new Date().toISOString(),
  platforms: {
    [`darwin-${arch}`]: {
      url: `https://github.com/SSBun/LinguaMarkReader/releases/download/v${app.version}/${filename}`,
      signature,
    },
  },
};
await writeFile(`${directory}/latest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`已生成当前架构的签名更新包和 latest.json：${directory}`);
console.log("尚未上传或发布。多架构发布须先合并 latest.json 的 platforms，再上传完整产物。");
