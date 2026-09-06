import { writable } from "svelte/store";

export type ThemeMode = "light" | "dark";

export const mode = writable<ThemeMode>("light");

export function getCurrentMode(): ThemeMode {
  let current: ThemeMode = "light";
  mode.subscribe((v) => (current = v))();
  return current;
}