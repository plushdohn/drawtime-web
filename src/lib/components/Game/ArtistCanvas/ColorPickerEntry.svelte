<script lang="ts">
	export let color: string;
	export let selected: boolean;
</script>

<button
	class="rounded-full w-6 h-6 mx-1 border-white"
	style="background-color: {color};"
	class:border-2={selected}
	on:click
/>
