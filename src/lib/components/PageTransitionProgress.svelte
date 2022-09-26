<script>
  import { navigating } from "$app/stores";
</script>

{#if $navigating}
  <div class="absolute inset-0 bg-yellow-500 animate-w-scale h-1" />
{/if}

<style scoped>
  .animate-w-scale {
    animation: scale-x 0.2s ease-in-out;
  }

  @keyframes scale-x {
    0% {
      width: 0%;
    }

    100% {
      width: 100%;
    }
  }
</style>
