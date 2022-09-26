<script lang="ts">
  import { page } from "$app/stores";
</script>

<div class="w-full flex flex-col justify-center items-center p-8 lg:p-16">
  <span class="font-bold text-5xl text-zinc-400 text-center">Oh no!</span>
  <span class="text-zinc-400 mt-2 text-center">
    {$page.status}: {$page.error.message}
  </span>
</div>
