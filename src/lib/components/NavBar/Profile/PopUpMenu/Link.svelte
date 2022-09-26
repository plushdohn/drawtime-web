<script lang="ts">
	export let href: string;
</script>

<a
	{href}
	class="flex items-center p-3 pr-12 font-semibold hover:bg-zinc-600 focus:bg-zinc-600 whitespace-nowrap"
>
	<slot />
</a>
