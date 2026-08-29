<script lang="ts">
  import TextInput from "../components/TextInput.svelte";
</script>

<form role="search" aria-label="游戏搜索">
  <TextInput
    label="搜索"
    labelHidden
    placeholder="请输入游戏名"
    autocomplete="off"
    spellcheck="false"
    aria-describedby="search-hint"
  />
</form>
