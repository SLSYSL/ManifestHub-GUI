<script lang="ts">
  import { onMount } from "svelte";
  import Neutralino from "@neutralinojs/lib";
  import Dock from "./components/Dock.svelte";
  import homeIcon from "./assets/home.svg?raw";
  import cogIcon from "./assets/cog.svg?raw";
  import HomePage from "./pages/Home.svelte";
  import SettingsPage from "./pages/Settings.svelte";

  let currentPage = "home";

  onMount(async () => {
    try {
      currentPage = await Neutralino.storage.getData("currentPage");
    } catch (e) {
      Neutralino.debug.log(`读取存储失败: ${e}`);
    }
  });

  const NavItems = [
    { id: "home", label: "首页", icon: homeIcon, page: HomePage },
    { id: "settings", label: "设置", icon: cogIcon, page: SettingsPage },
  ];
</script>

<Dock
  items={NavItems}
  activeId={currentPage}
  onSelect={async (id: string) => {
    currentPage = id;
    await Neutralino.storage.setData("currentPage", currentPage);
  }}
/>

<main>
  {#each NavItems as item}
    {#if currentPage == item.id}
      <h1 class="sr-only" tabindex="-1">{item.label}</h1>
    {/if}
    {@const Page = item.page}
    <section class="page" aria-hidden={currentPage !== item.id}>
      <Page />
    </section>
  {/each}
</main>

<style>
  .page {
    position: absolute;
    inset: 0;
    opacity: 0;
    padding: 10px 14px;
    pointer-events: none;
    visibility: hidden;
    transition:
      opacity 0.25s ease,
      visibility 0.25s;
  }

  .page[aria-hidden="false"] {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
  }
</style>
