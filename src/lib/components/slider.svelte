<script lang="ts">
    import { clsx } from "clsx";

    import ActuationInput from "$lib/components/actuation-input.svelte";

    let {
        value = $bindable(),
        min = 0,
        max = 100,
        step = 0.01,
        class: clazz = "",
        direction = "press",
        disabled = false,
        ...props
    } = $props();

    const percentage = $derived(((value - min) / (max - min)) * 100);
</script>

<div class={clsx("flex flex-col", clazz)}>
    <span
        class={clsx(
            "flex w-max items-center gap-1",
            disabled && "text-stone-500",
            !disabled && direction === "press" && "text-blue-200",
            !disabled && direction === "release" && "text-yellow-100",
        )}
    >
        <span class="text-xs font-bold uppercase">{direction}</span>
        {#if value}
            <ActuationInput class="w-8 text-sm!" bind:value {disabled} />
            mm
        {:else}
            ...
        {/if}
    </span>
    <div class="input-wrapper relative h-6 rounded-md">
        <input
            type="range"
            class="h-full w-full opacity-0"
            {min}
            {max}
            {step}
            {disabled}
            bind:value
            {...props}
        />
        <div
            class="pointer-events-none absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 overflow-clip rounded-lg bg-stone-500"
        ></div>
        <div
            class={clsx(
                "pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-1/2 rounded-full",
                disabled && "bg-stone-500",
                !disabled && direction === "press" && "bg-blue-200",
                !disabled && direction === "release" && "bg-yellow-100",
            )}
            style:left="{percentage}%"
        ></div>
    </div>
</div>
