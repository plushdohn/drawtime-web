<script lang="ts">
  import Nav from "$lib/components/NavBar/index.svelte";
  import PageTransitionProgress from "$lib/components/PageTransitionProgress.svelte";
  import type { LayoutData } from "./$types";

  export let data: LayoutData;
</script>

<div class="w-full min-h-screen flex flex-col bg-zinc-900">
  <Nav userProfile={data.profile} />
  <PageTransitionProgress />
  <slot />
</div>
