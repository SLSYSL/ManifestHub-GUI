<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let {
    children,
    as: tag = "div",
    cols = "auto-fill",
    minWidth = "260px",
    gap = "1.5rem",
    class: className = "",
    style: externalStyle = "",
    ...rest
  }: {
    children: () => any;
    as?: keyof HTMLElementTagNameMap;
    cols?: number | "auto-fill" | "auto-fit";
    minWidth?: string;
    gap?: string;
    class?: string;
    style?: string;
  } & HTMLAttributes<HTMLElement> = $props();

  const gridTemplateColumns = $derived.by(() => {
    if (typeof cols === "number") {
      return `repeat(${cols}, 1fr)`;
    }
    return `repeat(${cols}, minmax(${minWidth}, 1fr))`;
  });
</script>

<svelte:element
  this={tag}
  class={["grid", className].filter(Boolean).join(" ")}
  style={[
    `--grid-cols: ${gridTemplateColumns};`,
    `--grid-gap: ${gap};`,
    externalStyle,
  ]
    .filter(Boolean)
    .join(" ")}
  {...rest}
>
  {@render children()}
</svelte:element>

<style>
  .grid {
    display: grid;
    grid-template-columns: var(--grid-cols);
    gap: var(--grid-gap);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .grid :global(li) {
    list-style: none;
  }
</style>
