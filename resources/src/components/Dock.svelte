<script lang="ts">
  export type NavItem = {
    id: string;
    label: string;
    icon: string;
  };

  let {
    items,
    activeId = $bindable(),
  }: {
    items: NavItem[];
    activeId?: string;
  } = $props();
</script>

<nav class="dock" aria-label="主导航">
  <ul>
    {#each items as item}
      <li>
        <a
          href="#{item.id}"
          class="dock-item"
          aria-label={item.label}
          aria-current={activeId === item.id ? "page" : undefined}
          onclick={() => {
            activeId = item.id;
          }}
        >
          {@html item.icon}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .dock {
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    background-color: hsl(var(--surface));
    bottom: 24px;
    left: 50%;
    position: fixed;
    z-index: 1;
    transform: translateX(-50%);
  }

  .dock ul {
    display: flex;
    margin: 0;
    padding: 8px;
    list-style: none;
    gap: 8px;
  }

  .dock-item {
    position: relative;
    display: flex;
    border-radius: var(--radius);
    color: hsl(var(--muted-fg));
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      color 150ms ease,
      transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
    align-items: center;
    flex-direction: column;
    justify-content: center;
    min-height: 44px;
    min-width: 44px;
  }

  .dock-item :global(svg) {
    height: 24px;
    width: 24px;
    pointer-events: none;
    flex-shrink: 0;
  }

  .dock-item:hover {
    background: hsl(var(--muted));
    color: hsl(var(--fg));
    transform: scale(1.08);
  }

  .dock-item:active {
    transform: scale(0.96);
    transition-duration: transform 80ms ease;
  }

  .dock-item[aria-current="page"] {
    border: 1px solid hsl(var(--border));
    background: hsl(var(--accent) / 0.9);
    color: hsl(var(--accent-fg));
  }

  .dock-item:focus-visible {
    border-radius: var(--radius);
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }

  @media (hover: hover), (pointer: fine) {
    .dock-item::after {
      bottom: calc(100% + 6px);
      left: 50%;
      position: absolute;
      padding: 4px 10px;
      border: 1px solid hsl(var(--border));
      border-radius: calc(var(--radius) - 2px);
      background: hsl(var(--surface));
      color: hsl(var(--fg));
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.02em;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transform: translateX(-50%) translateY(4px);
      transition:
        opacity 150ms ease,
        transform 150ms ease;
      content: attr(aria-label);
    }

    .dock-item:hover::after {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dock-item,
    .dock-item :global(svg),
    .dock-item::after {
      transition: none;
    }

    .dock-item:hover :global(svg),
    .dock-item:active {
      transform: none;
    }
  }
</style>
