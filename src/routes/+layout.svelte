<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<main class="flex items-center justify-center bg-stone-900 text-white w-screen h-screen">
    {@render children?.()}
</main>

