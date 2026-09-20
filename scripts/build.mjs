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
await mkdir("dist/pdfjs", { recursive: true });
await cp("node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs", "dist/pdfjs/pdf.worker.min.mjs");
for (const directory of ["cmaps", "standard_fonts", "wasm", "iccs"]) {
  await cp(`node_modules/pdfjs-dist/${directory}`, `dist/pdfjs/${directory}`, { recursive: true });
}
await cp("node_modules/pdfjs-dist/LICENSE", "dist/pdfjs/LICENSE");
