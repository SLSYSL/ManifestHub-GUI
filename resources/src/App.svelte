<script lang="ts">
  import { onMount } from "svelte";
  import Neutralino from "@neutralinojs/lib";
  import Dock from "./components/Dock.svelte";
  import homeIcon from "./assets/home.svg?raw";
  import cogIcon from "./assets/cog.svg?raw";
  import HomePage from "./pages/Home.svelte";
  import SettingsPage from "./pages/Settings.svelte";

  let currentPage = $state("home");

  onMount(async () => {
    Neutralino.storage
      .getData("currentPage")
      .then((savedPage) => {
        if (typeof savedPage === "string" && savedPage) {
          currentPage = savedPage;
        }
      })
      .catch((e) => {
        Neutralino.debug.log(`读取存储失败: ${e}`);
      });
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
    <section class="page" aria-hidden={currentPage !== item.id}>
      <item.page />
    </section>
  {/each}
</main>

<style>
  .page {
    position: absolute;
    inset: 0;
    opacity: 0;
    height: 100%;
    overflow-y: auto;
    padding: 1.25rem;
    pointer-events: none;
    visibility: hidden;
    transition:
      opacity 120ms,
      visibility 120ms;
  }

  .page[aria-hidden="false"] {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
  }

  @media (prefers-reduced-motion: reduce) {
    .page {
      transition: none;
    }
  }
</style>
