<script lang="ts">
  import { registerSocketEventsListener } from "$lib/logic/client/live/socket";
  import { ServerEventKind } from "$lib/logic/shared";
  import { onMount } from "svelte";

  onMount(() => {
    return registerSocketEventsListener((event) => {
      if (event.kind === ServerEventKind.DRAWING_STARTED) {
        new Audio("/sounds/round-start.mp3").play();
      } else if (event.kind === ServerEventKind.CORRECT_GUESS) {
        const audio = new Audio("/sounds/correct-guess.mp3");

        audio.volume = 0.7;

        audio.play();
      } else if (event.kind === ServerEventKind.CHAT_MESSAGE) {
        const audio = new Audio("/sounds/chat-message.mp3");

        audio.volume = 0.2;

        audio.play();
      }
    });
  });
</script>
