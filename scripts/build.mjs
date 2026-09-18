import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
const app = JSON.parse(await readFile("src-tauri/tauri.conf.json", "utf8"));
await build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  define: {
    "process.env.NODE_ENV": '"production"',
    __APP_NAME__: JSON.stringify(app.productName),
    __APP_VERSION__: JSON.stringify(app.version),
  },
  outdir: "dist",
  format: "esm",
  splitting: true,
  minify: true,
  platform: "browser",
  target: ["safari17", "chrome120"],
});
await cp("public", "dist", { recursive: true });
