import Neutralino from "@neutralinojs/lib";
import { mode, getCurrentMode, type ThemeMode } from "./store";

const isBrowser = typeof window !== "undefined";

export async function applyTheme(newMode: ThemeMode): Promise<void> {
  mode.set(newMode);

  if (isBrowser) {
    document.documentElement.classList.toggle("dark", newMode === "dark");
  }

  if (isBrowser && typeof Neutralino !== "undefined") {
    try {
      await Neutralino.storage.setData("theme", newMode);
    } catch (e) {
      console.warn("[ModeWatcher] 保存失败:", e);
    }
  }
}

export async function toggleMode(): Promise<void> {
  const current = getCurrentMode();
  await applyTheme(current === "light" ? "dark" : "light");
}

export async function initTheme(): Promise<void> {
  try {
    const saved = await Neutralino.storage.getData("theme");
    if (saved === "dark" || saved === "light") {
      await applyTheme(saved);
      return;
    }
  } catch (_) { }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  await applyTheme(prefersDark ? "dark" : "light");
}