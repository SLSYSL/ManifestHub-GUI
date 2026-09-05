<script lang="ts">
  import { House, Settings } from "@lucide/svelte";
  import { ModeWatcher } from "mode-watcher";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import HomePage from "./pages/Home.svelte";
  import SettingsPage from "./pages/Settings.svelte";

  const TabsItems = [
    { id: "home", label: "首页", icon: House, page: HomePage },
    { id: "settings", label: "设置", icon: Settings, page: SettingsPage },
  ];
</script>

<ModeWatcher />

<Tabs.Root value={TabsItems[0].id}>
  <Tabs.List
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-1"
    variant="line"
  >
    {#each TabsItems as item}
      <Tabs.Trigger value={item.id} aria-label={item.label}>
        <item.icon />
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
  {#each TabsItems as item}
    <Tabs.Content value={item.id} class="p-5">
      <item.page />
    </Tabs.Content>
  {/each}
</Tabs.Root>
