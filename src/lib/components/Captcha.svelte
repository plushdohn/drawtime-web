<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";
  import { browser } from "$app/environment";

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
    if (browser) {
      // @ts-ignore
      window.handleCaptchaCallback = null;

      // @ts-ignore
      window.handleCaptchaRejection = null;
    }
  });
</script>

<svelte:head>
  <script src="https://www.google.com/recaptcha/api.js" async></script>
</svelte:head>

<div
  class={"g-recaptcha " + clazz}
  data-sitekey={PUBLIC_RECAPTCHA_SITE_KEY}
  data-callback="handleCaptchaCallback"
  data-expired-callback="handleCaptchaRejection"
  data-size="normal"
  data-error-callback="handleCaptchaRejection"
/>

<style global>
  .g-recaptcha {
    overflow: hidden;
    width: 298px;
    height: 74px;
  }

  .g-recaptcha iframe {
    margin: -1px 0px 0px -2px;
  }
</style>
