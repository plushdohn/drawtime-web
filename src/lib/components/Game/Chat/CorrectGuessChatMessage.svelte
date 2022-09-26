<script lang="ts">
  import type { Player } from "$lib/logic/shared";

  export let senderId: string;
  export let players: Player[];

  $: senderName = players.find((p) => p.id === senderId)?.username;
</script>

<div class="w-full mb-2">
  <span class="text-green-400 font-semibold">
    {senderName} guessed correctly!
  </span>
  <!--<audio src={correctGuessAudioUrl} autoplay />-->
</div>
