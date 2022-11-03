<script lang="ts">
  import type { ProfileModel } from "$lib/logic/shared-types";

  import NavBarProfileMenu from "./PopUpMenu/index.svelte";

  export let profile: ProfileModel;

  let isMenuOpen = false;
  let button: HTMLButtonElement;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function onMenuFocusOut(event: Event) {
    const newlyFocusedEl = (event as MouseEvent).relatedTarget as HTMLElement | null;

    if (newlyFocusedEl !== null && button.contains(newlyFocusedEl)) return;

    isMenuOpen = false;
  }
</script>

<button
  bind:this={button}
  on:click={toggleMenu}
  on:focusout={onMenuFocusOut}
  class="shrink-0 relative flex items-center p-1 rounded-full cursor-pointer hover:bg-zinc-700"
  class:bg-zinc-700={isMenuOpen}
>
  <img
    src={profile.avatarUrl}
    alt={profile.username}
    class="w-8 h-8 rounded-full z-10"
    referrerpolicy="no-referrer"
  />
  <NavBarProfileMenu open={isMenuOpen} />
</button>
