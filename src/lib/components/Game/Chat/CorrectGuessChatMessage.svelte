<script lang="ts">
  export let guesserName: string;
</script>

<div class="w-full mb-2">
  <span class="text-green-400 font-semibold">
    {guesserName} guessed correctly!
  </span>
  <!--<audio src={correctGuessAudioUrl} autoplay />-->
</div>
