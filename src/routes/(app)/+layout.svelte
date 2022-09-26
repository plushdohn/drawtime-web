<script lang="ts">
  import Nav from "$lib/components/NavBar/index.svelte";
  import PageTransitionProgress from "$lib/components/PageTransitionProgress.svelte";
</script>

<div class="w-full min-h-screen flex flex-col bg-zinc-900">
  <Nav />
  <PageTransitionProgress />
  <slot />
</div>
