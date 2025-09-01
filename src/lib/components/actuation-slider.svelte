<script lang="ts">
    import { nullOf } from "$lib";
    import { MAX_ACTUATION, MIN_ACTUATION } from "$lib/ak680max";
    import ActuationInput from "./actuation-input.svelte";

    let {
        topValue = $bindable(nullOf<number>()),
        bottomValue = $bindable(nullOf<number>()),
        min = 0,
        max = MAX_ACTUATION,
        minCap = MIN_ACTUATION,
    } = $props();

    let slider: HTMLDivElement;
    let dragging = $state<"top" | "bottom" | null>(null);

    const range = max - min;

    const clampActuationValue = (value: number) =>
        Math.round(Math.min(Math.max(value, minCap), max) * 100) / 100;
</script>

<svelte:window
    onmousemove={(e) => {
        if (!dragging) return;

        const sliderRect = slider.getBoundingClientRect();
        const value = clampActuationValue(
            ((e.clientY - sliderRect.top) / sliderRect.height) * range,
        );
        if (dragging === "top") {
            topValue = Math.min(value, bottomValue);
        } else if (dragging === "bottom") {
            bottomValue = Math.max(value, topValue);
        }
    }}
    onmouseup={() => (dragging = null)}
/>

<div class="relative flex h-full w-1 flex-col bg-stone-500 select-none" bind:this={slider}>
    <div class="bg-blue-400" style:height="{((topValue ?? MIN_ACTUATION) / range) * 100}%"></div>
    <div class="relative">
        <button
            class="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-1/2 rounded-full border-none bg-blue-200 outline-none"
            onmousedown={() => (dragging = "top")}
            aria-labelledby="top-thumb-label"
        ></button>
        <span
            class="absolute top-1/2 left-4 flex w-max -translate-y-1/2 items-center gap-1 text-blue-200"
            id="top-thumb-label"
        >
            <span class="text-xs font-bold uppercase">Press</span>
            {#if topValue}
                <ActuationInput class="w-8 text-sm!" bind:value={topValue} />
                mm
            {:else}
                ...
            {/if}
        </span>
    </div>
    <div class="flex-1"></div>
    <div class="relative">
        <button
            class="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-1/2 rounded-full border-none bg-yellow-100 outline-none"
            onmousedown={() => (dragging = "bottom")}
            aria-labelledby="bottom-thumb-label"
        ></button>
        <span
            class="absolute top-1/2 left-4 flex w-max -translate-y-1/2 items-center gap-1 text-yellow-100"
            id="bottom-thumb-label"
        >
            <span class="text-xs font-bold uppercase">Release</span>
            {#if bottomValue}
                <ActuationInput class="w-8 text-sm!" bind:value={bottomValue} />
                mm
            {:else}
                ...
            {/if}
        </span>
    </div>
    <div
        style:height="{(1 - (bottomValue ?? MAX_ACTUATION) / range) * 100}%"
        class="bg-yellow-300"
    ></div>
</div>
