<script lang="ts">
    import type { Snippet } from "svelte";
    import { backOut, cubicOut } from "svelte/easing";
    import { fade, scale } from "svelte/transition";

    const {
        close = () => {},
        children,
        class: clazz = "",
        modal,
        ...props
    }: {
        class?: string;
        maxWidth?: string;
        close?: () => void;
        modal?: boolean;
        children: Snippet;
    } = $props();

    let popup: HTMLDivElement;
</script>

<svelte:window onkeydown={(e) => e.code === "Escape" && close()} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="absolute top-0 left-0 z-10 h-full w-full {modal
        ? 'bg-opacity-30 bg-black backdrop-blur-xl'
        : ''}"
    onmousedown={() => close()}
    transition:fade={{ duration: 200, easing: cubicOut }}
>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="absolute top-1/2 left-1/2 z-20 w-[calc(100%-1.75rem)] -translate-x-1/2
            -translate-y-1/2 overflow-clip rounded-3xl bg-stone-800 shadow-lg shadow-[rgb(0_0_0_/_0.3)] sm:w-fit {clazz}"
        bind:this={popup}
        transition:scale={{ duration: 400, easing: backOut, start: 0.2 }}
        onmousedown={(e) => e.stopPropagation()}
        onclick={(e) => e.stopPropagation()}
        {...props}
    >
        {@render children()}
    </div>
</div>
