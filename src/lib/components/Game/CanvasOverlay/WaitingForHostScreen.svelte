<script lang="ts">
  import type { Player } from "$lib/logic/shared-types";

  export let owner: string;
  export let players: Player[];

  $: ownerName = players.find((p) => p.id === owner)?.username;
</script>

<div class="p-16 bg-zinc-800 rounded flex flex-col items-center text-center max-w-sm">
  <span class="font-bold text-3xl">Waiting for host...</span>
  <span class="text-zinc-400 mt-4">
    There are enough players to begin, but <span class="font-semibold">
      {ownerName}
    </span>
    might be waiting for more.
  </span>
</div>
