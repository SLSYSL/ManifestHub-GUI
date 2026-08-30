<script lang="ts">
  let {
    children,
    padding = "12px",
    class: className = "",
    style: externalStyle = '',
    as: tag = "div",
    ...rest
  } = $props();
</script>

<tag
  class={["card", className].filter(Boolean).join(" ")}
  style={[`--card-padding: ${padding};`, externalStyle]
    .filter(Boolean)
    .join(" ")}
  {...rest}
>
  {@render children()}
</tag>

<style>
  .card {
    padding: var(--card-padding, 12px);
    background-color: hsl(var(--surface));
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
  }
</style>
