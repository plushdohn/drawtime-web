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
  import RoundStartingMessage from "./RoundStartingMessage.svelte";
  import CloseGuessMessage from "./CloseGuessMessage.svelte";

  export let phase: GamePhase;
  export let artistId: string;
  export let clue: string | null;
  export let userId: string;
  export let players: Player[];
  export let socket: ExtendedSocket;

  type ComponentChatEvent =
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
    | {
        kind: ChatEventKind.ROUND_STARTED;
        payload: {
          artistName: string;
        };
      }
    | {
        kind: ChatEventKind.CLOSE_GUESS;
        payload: string;
      };

  let events: ComponentChatEvent[] = [];
  let inputValue = "";
  let chatDiv: HTMLElement;

  let pending = false;

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

        pushEvent({
          kind: ChatEventKind.MESSAGE,
          payload: {
            senderName: player.username,
            contents: e.payload.contents,
          },
        });
      } else if (e.kind === ChatEventKind.CORRECT_GUESS) {
        const player = players.find((p) => p.id === e.payload);

        if (!player) {
          return console.warn("Received a guess from an unknown player, ignoring.");
        }

        pushEvent({
          kind: ChatEventKind.CORRECT_GUESS,
          payload: {
            guesserName: player.username,
          },
        });
      } else if (e.kind === ChatEventKind.ROUND_STARTED) {
        const artist = players.find((p) => p.id === e.payload);

        if (!artist) {
          return console.warn("Received a round start event with an artist that doesn't exist.");
        }

        pushEvent({
          kind: ChatEventKind.ROUND_STARTED,
          payload: { artistName: artist.username },
        });
      }
    });

    return unsub;
  });

  function pushEvent(event: ComponentChatEvent) {
    events = [...events, event];
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (inputValue.trim().length > 0) {
      if (
        clue &&
        phase === GamePhase.Drawing &&
        artistId !== userId &&
        clue.length === inputValue.length
      ) {
        pending = true;

        try {
          const res = await guess(socket, inputValue.toLowerCase());

          if ("close" in res) {
            console.log("CLOSE GUESS DETECTED");
            pushEvent({ kind: ChatEventKind.CLOSE_GUESS, payload: inputValue });
          }
        } catch {
          console.warn("An error occurred while guessing, ignoring.");
        } finally {
          pending = false;
        }
      } else {
        sendChatMessage(socket, inputValue);
      }

      inputValue = "";
    }
  }
</script>

<div
  class="w-full min-h-0 h-full flex flex-col landscape:rounded landscape:bg-zinc-800 mt-1 landscape:mt-0 landscape:ml-3 landscape:w-80"
>
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
      {:else if event.kind === ChatEventKind.ROUND_STARTED}
        <RoundStartingMessage artistName={event.payload.artistName} />
      {:else if event.kind === ChatEventKind.CLOSE_GUESS}
        <CloseGuessMessage guess={event.payload} />
      {/if}
    {/each}
  </div>
  <form class="w-full md:p-4" on:submit={handleSubmit}>
    <input
      type="text"
      id="guess-input"
      autocomplete="off"
      placeholder="Guess or chat..."
      class="w-full bg-zinc-700 md:p-3 p-2 md:rounded-sm text-white"
      bind:value={inputValue}
    />
  </form>
</div>
