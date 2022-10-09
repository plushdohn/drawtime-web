<script lang="ts">
  import type { ExtendedSocket } from "$lib/logic/client/live/types";
  import { onMount } from "svelte";

  export let socket: ExtendedSocket;

  onMount(() => {
    function handleDrawingStarted() {
      const audio = new Audio("/sounds/round-start.mp3");

      audio.volume = 0.4;

      audio.play();
    }

    function handleCorrectGuess() {
      const audio = new Audio("/sounds/correct-guess.mp3");

      audio.volume = 0.4;

      audio.play();
    }

    function handleChatMessage() {
      const audio = new Audio("/sounds/chat-message.mp3");

      audio.volume = 0.2;

      audio.play();
    }

    socket.on("drawingStarted", handleDrawingStarted);
    socket.on("correctGuess", handleCorrectGuess);
    socket.on("chatMessage", handleChatMessage);

    return () => {
      socket.off("drawingStarted", handleDrawingStarted);
      socket.off("correctGuess", handleCorrectGuess);
      socket.off("chatMessage", handleChatMessage);
    };
  });
</script>
