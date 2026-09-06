<script lang="ts">
  import { onMount } from "svelte";
  import { initTheme } from "./core";

  onMount(() => {
    initTheme();
  });
</script>
