<script lang="ts">
  import Dock from "./components/Dock.svelte";
  import homeIcon from "./assets/home.svg?raw";
  import cogIcon from "./assets/cog.svg?raw";
  import HomePage from "./pages/Home.svelte";
  import SettingsPage from "./pages/Settings.svelte";

  let currentPage = $state("home");

  const NavItems = [
    { id: "home", label: "首页", icon: homeIcon, page: HomePage },
    { id: "settings", label: "设置", icon: cogIcon, page: SettingsPage },
  ];
</script>

<Dock items={NavItems} bind:activeId={currentPage} />

<main>
  {#each NavItems as item}
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
