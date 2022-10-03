<script lang="ts">
  let clazz: string;
  export { clazz as class };
  export let callback: () => void;
</script>

<button class={`font-semibold rounded-sm p-2.5 ${clazz}`} on:click={callback}><slot /></button>
