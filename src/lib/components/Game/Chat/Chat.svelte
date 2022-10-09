<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import CorrectGuessMessage from "./CorrectGuessChatMessage.svelte";
  import { GamePhase, type Player } from "$lib/logic/shared-types";
  import { guess } from "$lib/logic/client/live/game";
  import {
    ChatEventKind,
    sendChatMessage,
    subscribeToChatEvents,
  } from "$lib/logic/client/live/chat";
  import type { ExtendedSocket } from "$lib/logic/client/live/types";

  export let phase: GamePhase;
  export let artistId: string;
  export let clue: string | null;
  export let userId: string;
  export let players: Player[];
  export let socket: ExtendedSocket;

  let events: (
    | {
        kind: ChatEventKind.MESSAGE;
        payload: {
          senderName: string;
          contents: string;
        };
      }
    | {
        kind: ChatEventKind.CORRECT_GUESS;
        payload: { guesserName: string };
      }
  )[] = [];
  let inputValue = "";
  let chatDiv: HTMLElement;

  afterUpdate(() => {
    chatDiv.scrollTop = chatDiv.scrollHeight;
  });

  onMount(() => {
    const unsub = subscribeToChatEvents(socket, (e) => {
      if (e.kind === ChatEventKind.MESSAGE) {
        const player = players.find((p) => p.id === e.payload.senderId);

        if (!player) {
          return console.warn("Received a message from an unknown player, ignoring.");
        }

        events = [
          ...events,
          {
            kind: ChatEventKind.MESSAGE,
            payload: {
              senderName: player.username,
              contents: e.payload.contents,
            },
          },
        ];
      } else if (e.kind === ChatEventKind.CORRECT_GUESS) {
        const player = players.find((p) => p.id === e.payload);

        if (!player) {
          return console.warn("Received a guess from an unknown player, ignoring.");
        }

        events = [
          ...events,
          {
            kind: ChatEventKind.CORRECT_GUESS,
            payload: {
              guesserName: player.username,
            },
          },
        ];
      }
    });

    return unsub;
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (inputValue.trim().length > 0) {
      if (
        clue &&
        phase === GamePhase.Drawing &&
        artistId !== userId &&
        clue.length === inputValue.length
      ) {
        guess(socket, inputValue.toLowerCase());
      } else {
        sendChatMessage(socket, inputValue);
      }

      inputValue = "";
    }
  }
</script>

<div class="w-96 h-full bg-zinc-800 rounded ml-4 flex flex-col">
  <div class="w-full h-full overflow-y-scroll p-4" bind:this={chatDiv}>
    {#each events as event}
      {#if event.kind === ChatEventKind.MESSAGE}
        <div class="w-full mb-2">
          <span class="text-yellow-400 font-semibold">
            {event.payload.senderName}:
          </span>
          <span class="text-white">
            {event.payload.contents}
          </span>
        </div>
      {:else if event.kind === ChatEventKind.CORRECT_GUESS}
        <CorrectGuessMessage guesserName={event.payload.guesserName} />
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
