<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let {
    children,
    label = "",
    labelHidden = false,
    padding = "12px",
    class: className = "",
    style: externalStyle = "",
    as: tag = "div",
    ...rest
  }: {
    children: () => any;
    label?: string;
    labelHidden?: boolean;
    padding?: string;
    class?: string;
    style?: string;
    as?: keyof HTMLElementTagNameMap;
  } & HTMLAttributes<HTMLElement> = $props();
</script>

<svelte:element
  this={tag}
  class={["card", className].filter(Boolean).join(" ")}
  style={[`--card-padding: ${padding};`, externalStyle]
    .filter(Boolean)
    .join(" ")}
  {...rest}
>
  {#if label}
    <h2 class:sr-only={labelHidden} style="margin: 0 0 4px 0">{label}</h2>
  {/if}
  {@render children()}
</svelte:element>

<style>
  .card {
    padding: var(--card-padding, 12px);
    background-color: hsl(var(--surface));
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    font-size: 0.875rem;
  }
</style>
