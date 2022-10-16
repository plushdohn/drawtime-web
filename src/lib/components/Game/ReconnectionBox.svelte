<script>
  import { slide } from "svelte/transition";
  import Spinner from "../Spinner.svelte";
</script>

<div
  class="fixed right-0 bottom-0 m-4 bg-red-500 flex items-center gap-2 rounded-sm p-2.5"
  transition:slide|local={{ duration: 200 }}
>
  <span class="font-semibold">Lost connection, reconnecting...</span>
  <Spinner class="w-7" />
</div>
