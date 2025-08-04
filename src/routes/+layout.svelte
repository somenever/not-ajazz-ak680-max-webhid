<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Not AJAZZ AK680 Max WebHID</title>
</svelte:head>

<main class="flex h-screen w-screen items-center justify-center bg-stone-900 text-white">
    {@render children?.()}
</main>
