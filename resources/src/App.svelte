<script lang="ts">
  import Dock from "./components/Dock.svelte";
  import homeIcon from "./assets/home.svg?raw";
  import cogIcon from "./assets/cog.svg?raw";
  import HomePage from "./pages/Home.svelte";

  let currentPage = $state("home");

  const NavItems = [
    { id: "home", label: "首页", icon: homeIcon },
    { id: "settings", label: "设置", icon: cogIcon },
  ];
</script>

<Dock items={NavItems} bind:activeId={currentPage} />

<main>
  <section class="page" aria-hidden={currentPage !== "home"}>
    <HomePage />
  </section>
  <section class="page" aria-hidden={currentPage !== "settings"}>Test</section>
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
