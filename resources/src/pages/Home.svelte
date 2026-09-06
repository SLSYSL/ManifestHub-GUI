<script lang="ts">
  import { Input } from "$lib/components/ui/input/index.js";

  let loading = $state(true);
</script>

<form role="search" aria-label="游戏搜索" class="mb-3">
  <Input aria-label="游戏搜索框" placeholder="请输入游戏名" />
</form>

{#if loading}
  <p class="shimmer text-center text-muted-foreground">正在加载&hellip;</p>
{/if}
