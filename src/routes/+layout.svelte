<script lang="ts">
    import { onMount } from "svelte";

    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";

    let { children } = $props();

    let showTitle = $state(false);

    onMount(() => {
        // Hide the title in standalone PWA
        showTitle = !window.matchMedia("(display-mode: standalone)").matches;
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    {#if showTitle}
        <title>Not AJAZZ AK680 MAX Web Utility</title>
    {/if}
</svelte:head>

<main
    class="flex h-screen w-screen items-center justify-center overflow-y-auto bg-stone-900 text-white"
>
    {@render children?.()}
</main>
