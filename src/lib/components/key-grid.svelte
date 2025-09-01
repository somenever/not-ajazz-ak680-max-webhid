<script lang="ts">
    import { SquareDashedMousePointerIcon } from "@lucide/svelte";
    import { SvelteSet } from "svelte/reactivity";

    import { KEYMAP, type Key } from "$lib/ak680max";
    import keyDefs from "$lib/keys.json";
    import ActuationSlider from "$lib/components/actuation-slider.svelte";
    import ActuationInput from "./actuation-input.svelte";

    let {
        showAllActuations,
        onActuationChange,
        keys = $bindable(),
    }: { showAllActuations?: boolean; onActuationChange?: () => void; keys: Key[] } = $props();

    const unitMultiplier = 4;

    let isDragging = $state(false);
    let isAddingSelections = true;
    let selectedKeys = new SvelteSet<number>();

    function toggleSelection(key: number) {
        if (isAddingSelections) {
            selectedKeys.add(key);
        } else {
            selectedKeys.delete(key);
        }
    }

    export function selectAll() {
        isAddingSelections = !selectedKeys.has(0);
        for (const key of keys) {
            if (KEYMAP[key.code]) {
                toggleSelection(key.code);
            }
        }
    }

    const allAreSame = <T,>(arr: T[]) => arr.every((item) => item === arr[0]);
    const getCommonValue = <T,>(arr: T[]): T | null => (allAreSame(arr) ? arr[0] : null);

    const selectedKeysDownActuation = $derived(
        getCommonValue([...selectedKeys.values().map((key) => keys[key].downActuation)]),
    );
    const selectedKeysUpActuation = $derived(
        getCommonValue([...selectedKeys.values().map((key) => keys[key].upActuation)]),
    );
</script>

<svelte:window onmouseup={() => (isDragging = false)} />

<div class="h-30">
    {#if selectedKeys.size !== 0}
        <div class="flex h-full w-full items-center gap-8 px-4">
            <div
                class="font-keys grid h-12 min-w-12 place-items-center rounded-md bg-stone-900 px-4"
            >
                {#if selectedKeys.size === 1}
                    {keyDefs[(KEYMAP[selectedKeys.values().next().value!] || null)!].name}
                {:else if selectedKeys.size === Object.values(keyDefs).length}
                    All keys
                {:else}
                    {selectedKeys.size} keys
                {/if}
            </div>

            <div class="flex h-full flex-col gap-2">
                <h2 class="text-xs font-bold uppercase">Actuation Point</h2>

                <ActuationSlider
                    bind:topValue={
                        () => selectedKeysDownActuation,
                        (value) => {
                            if (value) {
                                onActuationChange?.();
                                selectedKeys.forEach((key) => (keys[key].downActuation = value));
                            }
                        }
                    }
                    bind:bottomValue={
                        () => selectedKeysUpActuation,
                        (value) => {
                            if (value) {
                                onActuationChange?.();
                                selectedKeys.forEach((key) => (keys[key].upActuation = value));
                            }
                        }
                    }
                    max={3.2}
                />
            </div>
        </div>
    {:else}
        <div class="flex h-full flex-col items-center justify-center gap-2 opacity-50">
            <SquareDashedMousePointerIcon />
            Select one or more keys to change options
        </div>
    {/if}
</div>

<div
    class="grid gap-1 active:cursor-grabbing"
    style:grid-template-columns="repeat({16 * unitMultiplier}, 1fr)"
    style:grid-template-rows="repeat(4, 3rem)"
>
    {#each keys as key}
        {@const name = KEYMAP[key.code]}
        {#if name}
            {@const keyDef = keyDefs[name]}
            <button
                class={[
                    "font-keys group relative flex items-center justify-center rounded-md bg-stone-900 p-3 select-none",
                    selectedKeys.has(key.code) && "outline-2 -outline-offset-1 outline-red-600",
                    isDragging ? "cursor-grabbing" : "cursor-grab",
                ]}
                onmousedown={() => {
                    // Add selections if an unselected key was clicked, remove if it was a selected one
                    isAddingSelections = !selectedKeys.has(key.code);
                    isDragging = true;
                }}
                onclick={() => toggleSelection(key.code)}
                onmousemove={() => isDragging && toggleSelection(key.code)}
                style:grid-column="{keyDef.column * unitMultiplier + 1} / span {keyDef.width *
                    unitMultiplier}"
                style:grid-row={keyDef.row + 1}
            >
                {keyDef.name}
                <ActuationInput
                    bind:value={key.upActuation}
                    class={[
                        "absolute -top-0 left-1/2 z-50 w-6 -translate-x-1/2 text-yellow-100 group-hover:visible",
                        !showAllActuations && "invisible",
                        isDragging && "cursor-grabbing",
                    ]}
                />
                <ActuationInput
                    bind:value={key.downActuation}
                    class={[
                        "absolute -bottom-0 left-1/2 z-50 w-8 -translate-x-1/2 text-blue-200 group-hover:visible",
                        !showAllActuations && "invisible",
                        isDragging && "cursor-grabbing",
                    ]}
                />
            </button>
        {/if}
    {/each}
</div>
