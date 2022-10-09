<script lang="ts">
  import SignInButton from "./SignInButton.svelte";
  import Logo from "./Logo.svelte";
  import Profile from "./Profile/index.svelte";
  import CreateTopicIcon from "../icons/CreateTopicIcon.svelte";
  import type { ProfileModel } from "$lib/logic/shared-types";

  export let userProfile: ProfileModel | null;
</script>

<nav class="flex items-center justify-between h-16 px-4 bg-zinc-800">
  <Logo />

  {#if userProfile !== null}
    <div class="flex items-center gap-4">
      <a
        href="/create-topic"
        class="hover:bg-zinc-600 p-2 rounded text-zinc-400 hover:text-zinc-200"
      >
        <CreateTopicIcon class="w-6 fill-current" />
      </a>
      <Profile profile={userProfile} />
    </div>
  {:else}
    <SignInButton />
  {/if}
</nav>
