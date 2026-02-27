<script lang="ts">
    import { SvelteSet } from "svelte/reactivity";
    import { tick, type Snippet } from "svelte";

    import { nullOf } from "$lib";
    import { KEYMAP, type Key, type Keyboard } from "$lib/ak680max";
    import keyDefs from "$lib/keys.json";

    const {
        keyboard,
        keyOverlay,
        selectedKeys,
    }: {
        keyboard: Keyboard;
        keyOverlay?: Snippet<[Key]>;
        selectedKeys?: SvelteSet<number>;
    } = $props();

    const UNIT_MULTIPLIER = 4;
    const DRAG_DELAY_MS = 100;

    let dragStartTime = $state(nullOf<number>());
    let isAddingSelections = true;

    function toggleSelection(key: number) {
        if (isAddingSelections) {
            selectedKeys!.add(key);
        } else {
            selectedKeys!.delete(key);
        }
    }

    export const isDragging = () => dragStartTime && Date.now() - dragStartTime > DRAG_DELAY_MS;

    export async function selectAll() {
        if (!selectedKeys) return;

        isAddingSelections = selectedKeys.size === 0;
        for (const key of keyboard.keys) {
            if (KEYMAP[key.code]) {
                toggleSelection(key.code);
                await tick();
            }
        }
    }
</script>

<svelte:window onmouseup={() => (dragStartTime = null)} />

<div
    class="grid gap-1 active:cursor-grabbing"
    style:grid-template-columns="repeat({16 * UNIT_MULTIPLIER}, 1fr)"
    style:grid-template-rows="repeat(4, 3rem)"
>
    {#each keyboard.keys as key}
        {@const name = KEYMAP[key.code]}
        {#if name}
            {@const keyDef = keyDefs[name]}
            <button
                class={[
                    "font-keys relative flex items-center justify-center rounded-md bg-stone-900 p-3 select-none",
                    selectedKeys?.has(key.code)
                        ? "outline-2 -outline-offset-1 outline-red-600"
                        : "focus-visible:outline-none",
                    selectedKeys && (isDragging() ? "cursor-grabbing" : "cursor-grab"),
                ]}
                onmousedown={() => {
                    if (!selectedKeys) return;

                    // Add selections if an unselected key was clicked, remove if it was a selected one
                    isAddingSelections = !selectedKeys.has(key.code);
                    dragStartTime = Date.now();
                }}
                onclick={() => {
                    if (!selectedKeys) return;

                    if (selectedKeys.size === 1) selectedKeys.clear();
                    toggleSelection(key.code);
                }}
                onmousemove={() => {
                    isDragging() && toggleSelection(key.code);
                }}
                style:grid-column="{keyDef.column * UNIT_MULTIPLIER + 1} / span {keyDef.width *
                    UNIT_MULTIPLIER}"
                style:grid-row={keyDef.row + 1}
            >
                {keyDef.name}
                {@render keyOverlay?.(key)}
            </button>
        {/if}
    {/each}
</div>
