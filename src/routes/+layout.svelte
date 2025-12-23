<script lang="ts">
    import { onMount } from "svelte";

    import "../app.css";

    let { children } = $props();

    onMount(() => {
        if (window.matchMedia("(display-mode: standalone)").matches) {
            document.querySelector("title")?.remove();
        }
    });
</script>

<main class="flex h-screen w-screen flex-col items-center overflow-y-auto bg-stone-900 text-white">
    {@render children?.()}
</main>
