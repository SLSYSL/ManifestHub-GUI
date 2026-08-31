<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  let {
    value = "",
    label = "",
    placeholder = "",
    id = crypto.randomUUID(),
    labelHidden = false,
    ...rest
  }: {
    value?: string;
    label?: string;
    placeholder?: string;
    id?: string;
    labelHidden?: boolean;
  } & HTMLInputAttributes = $props();
</script>

{#if label}
  <label for={id} class:sr-only={labelHidden}>{label}</label>
{/if}
<input type="text" {id} bind:value {placeholder} {...rest} />

<style>
  input {
    height: 2.25rem;
    padding: 0 12px;
    width: 100%;
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    background-color: hsl(var(--muted));
    color: hsl(var(--fg));
    font-size: 0.875rem;
    transition: border-color 150ms ease;
  }

  input::placeholder {
    color: hsl(var(--muted-fg) / 0.6);
    font-weight: 400;
  }

  input:hover {
    border-color: hsl(var(--muted-fg));
  }

  input:focus {
    border-color: hsl(var(--accent));
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    input {
      transition: none;
    }
  }
</style>
