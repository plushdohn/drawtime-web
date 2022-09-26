<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";

  export let callback: (token: string | null) => void;

  let clazz = "";
  export { clazz as class };

  function handleCaptchaCallback(token: string) {
    callback(token);
  }

  function handleCaptchaRejection() {
    callback(null);
  }

  onMount(() => {
    // @ts-ignore
    window.handleCaptchaCallback = handleCaptchaCallback;

    // @ts-ignore
    window.handleCaptchaRejection = handleCaptchaRejection;
  });

  onDestroy(() => {
    // @ts-ignore
    window.handleCaptchaCallback = null;

    // @ts-ignore
    window.handleCaptchaRejection = null;
  });
</script>

<svelte:head>
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</svelte:head>

<div
  data-theme="light"
  class={"g-recaptcha " + clazz}
  data-sitekey={PUBLIC_RECAPTCHA_SITE_KEY}
  data-callback="handleCaptchaCallback"
  data-expired-callback="handleCaptchaRejection"
  data-error-callback="handleCaptchaRejection"
/>
