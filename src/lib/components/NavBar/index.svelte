<script>
  import Spinner from "$lib/components/Spinner.svelte";
  import { userProfileStore } from "$lib/logic/client/auth";
  import SignInButton from "./SignInButton.svelte";
  import Logo from "./Logo.svelte";
  import Profile from "./Profile/index.svelte";
  import { browser } from "$app/environment";
  import CreateTopicIcon from "../icons/CreateTopicIcon.svelte";
</script>

<nav class="flex items-center justify-between h-16 px-4 bg-zinc-800">
  <Logo />

  {#if $userProfileStore.pending || !browser}
    <Spinner class="w-7" />
  {:else if $userProfileStore.profile}
    <div class="flex items-center gap-4">
      <a
        href="/create-topic"
        class="hover:bg-zinc-600 p-2 rounded text-zinc-400 hover:text-zinc-200"
      >
        <CreateTopicIcon class="w-6 fill-current" />
      </a>
      <Profile profile={$userProfileStore.profile} />
    </div>
  {:else}
    <SignInButton />
  {/if}
</nav>
