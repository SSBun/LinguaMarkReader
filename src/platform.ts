import { invoke } from "@tauri-apps/api/core";

export type DirectoryFileKind = "markdown" | "image" | "other";
export interface DirectoryTreeEntry {
  name: string;
  path: string;
  type: "directory" | "file";
  fileKind?: DirectoryFileKind;
  children?: DirectoryTreeEntry[];
}
export interface DirectoryBrowserState {
  status: "none" | "granted";
  rootName?: string;
  entries?: DirectoryTreeEntry[];
}
export type DirectoryFileContent =
  | { kind: "markdown"; path: string; text: string }
  | { kind: "image"; path: string; dataUrl: string };

export function directoryFileKind(path: string): DirectoryFileKind {
  if (/\.md$/iu.test(path)) return "markdown";
  return /\.(png|jpe?g|gif|webp|avif|svg)$/iu.test(path) ? "image" : "other";
}

export const pickEntry = (): Promise<{ kind: "file" | "directory"; path: string } | null> => invoke("pick_entry");
export const pickDirectory = (): Promise<string | null> => invoke("pick_directory");
export const readFile = (path: string): Promise<DirectoryFileContent> => invoke("read_file", { path });
export const readDirectory = (path: string): Promise<DirectoryBrowserState> => invoke("read_directory", { path });
export const openExternal = (url: string): Promise<void> => invoke("open_external", { url });

const LIBRARY_KEY = "linguamark-reader-library-v1";

export async function readLibrary(): Promise<Record<string, unknown>> {
  const value: unknown = JSON.parse(localStorage.getItem(LIBRARY_KEY) ?? "{}");
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

export async function writeLibrary(changes: Record<string, unknown>): Promise<void> {
  // No asynchronous gap between read and write: rapid favorite/recent updates cannot overwrite each other.
  const stored: unknown = JSON.parse(localStorage.getItem(LIBRARY_KEY) ?? "{}");
  const current = typeof stored === "object" && stored !== null && !Array.isArray(stored) ? stored : {};
  localStorage.setItem(LIBRARY_KEY, JSON.stringify({ ...current, ...changes }));
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : typeof error === "string" ? error : "操作失败，请重试";
}
