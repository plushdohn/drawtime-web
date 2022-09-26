<script lang="ts">
  import AccountSettingsIcon from "$lib/components/icons/AccountSettingsIcon.svelte";
  import LogoutIcon from "$lib/components/icons/LogoutIcon.svelte";
  import TopicsIcon from "$lib/components/icons/TopicsIcon.svelte";
  import NavBarProfileMenuLink from "./Link.svelte";

  export let open = false;
</script>

<div
  class:hidden={!open}
  class="absolute top-1/2 right-0 text-white bg-zinc-700 flex flex-col rounded overflow-hidden"
>
  <NavBarProfileMenuLink href="/my-topics">
    <TopicsIcon class="mr-3 w-6 fill-zinc-400" /> My topics
  </NavBarProfileMenuLink>
  <NavBarProfileMenuLink href="/account">
    <AccountSettingsIcon class="mr-3 w-6 fill-zinc-400" /> Account
  </NavBarProfileMenuLink>
  <NavBarProfileMenuLink href="/logout">
    <LogoutIcon class="mr-3 w-6 fill-zinc-400" /> Sign out
  </NavBarProfileMenuLink>
</div>
