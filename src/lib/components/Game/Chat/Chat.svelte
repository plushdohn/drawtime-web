<script lang="ts">
  import { onMount } from "svelte";
  import CorrectGuessMessage from "./CorrectGuessChatMessage.svelte";
  import { subscribeToSocketEvents } from "$lib/logic/client/sockets";
  import { GamePhase, ServerEvent, type Player } from "$lib/logic/shared";
  import { guess, sendChatMessage } from "$lib/logic/client/game";

  const enum ChatEventKind {
    Message,
    CorrectGuess,
  }

  export let phase: GamePhase;
  export let artistId: string;
  export let clue: string | null;
  export let userId: string;
  export let players: Player[];
  export let socket: WebSocket;

  let events: (
    | {
        type: ChatEventKind.Message;
        payload: {
          senderId: string;
          contents: string;
        };
      }
    | {
        type: ChatEventKind.CorrectGuess;
        payload: string;
      }
  )[] = [];
  let inputValue = "";
  let chatDiv: HTMLElement;

  onMount(() => {
    return subscribeToSocketEvents(([command, args]) => {
      if (command === ServerEvent.CHAT_MESSAGE) {
        events = [
          ...events,
          {
            type: ChatEventKind.Message,
            payload: {
              senderId: args[0],
              contents: decodeURI(args[1]),
            },
          },
        ];
        chatDiv.scrollTop = chatDiv.scrollHeight;
      } else if (command === ServerEvent.CORRECT_GUESS) {
        events = [
          ...events,
          {
            type: ChatEventKind.CorrectGuess,
            payload: args[0],
          },
        ];
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
    });
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (
      clue &&
      inputValue.trim().length > 0 &&
      phase === GamePhase.Drawing &&
      artistId !== userId &&
      clue.length === inputValue.length
    ) {
      guess(socket, inputValue);
    } else {
      sendChatMessage(socket, inputValue);
    }

    inputValue = "";
  }
</script>

<div class="w-96 h-full bg-zinc-800 rounded ml-4 flex flex-col">
  <div class="w-full h-full overflow-y-scroll p-4" bind:this={chatDiv}>
    {#each events as event}
      {#if event.type === ChatEventKind.Message}
        <div class="w-full mb-2">
          <span class="text-yellow-400 font-semibold">
            {players.find((p) => p.id === event.payload.senderId)?.username}
          </span>
          <span class="text-white">
            {event.payload.contents}
          </span>
        </div>
      {:else if event.type === ChatEventKind.CorrectGuess}
        <CorrectGuessMessage senderId={event.payload} {players} />
      {/if}
    {/each}
  </div>
  <form class="w-full p-4" on:submit={handleSubmit}>
    <input
      type="text"
      placeholder="Guess or chat..."
      class="w-full bg-zinc-700 p-4 rounded text-white"
      bind:value={inputValue}
    />
  </form>
</div>
