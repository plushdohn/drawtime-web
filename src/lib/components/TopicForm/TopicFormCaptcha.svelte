<script lang="ts">
  import Captcha from "../Captcha.svelte";

  export let token: string | null = null;
  export let error: string | undefined = undefined;
  export let validate: (e: string) => void;

  function handleCaptchaChange(e: string | null) {
    token = e;

    validate("captcha");
  }
</script>

<Captcha
  callback={handleCaptchaChange}
  class={`bg-zinc-900 mt-12 border-red-500 border-red-500 self-start ${
    error !== undefined ? "border-2" : ""
  }`}
/>
{#if error !== undefined}
  <span class="text-zinc-400 text-sm text-red-500 mt-2">Please complete the captcha.</span>
{/if}
