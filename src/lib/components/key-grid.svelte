<script lang="ts">
    import { SquareDashedMousePointerIcon } from "@lucide/svelte";
    import { SvelteSet } from "svelte/reactivity";
    import { tick } from "svelte";

    import { KEYMAP, RT_MAX_SENSITIVITY, RT_MIN_SENSITIVITY, type Key } from "$lib/ak680max";
    import { nullOf } from "$lib";
    import keyDefs from "$lib/keys.json";
    import ActuationSlider from "$lib/components/actuation-slider.svelte";
    import ActuationInput from "$lib/components/actuation-input.svelte";
    import ToggleSwitch from "$lib/components/toggle-switch.svelte";
    import Slider from "$lib/components/slider.svelte";

    let {
        showAllActuations,
        onActuationChange,
        keys = $bindable(),
    }: { showAllActuations?: boolean; onActuationChange?: () => void; keys: Key[] } = $props();

    const UNIT_MULTIPLIER = 4;
    const DRAG_DELAY_MS = 100;

    let separateRTPressRelease = $state(false);
    let dragStartTime = $state(nullOf<number>());
    let isAddingSelections = true;
    let selectedKeys = new SvelteSet<number>();

    const isDragging = () => dragStartTime && Date.now() - dragStartTime > DRAG_DELAY_MS;

    function toggleSelection(key: number) {
        if (isAddingSelections) {
            selectedKeys.add(key);
        } else {
            selectedKeys.delete(key);
        }
    }

    export async function selectAll() {
        isAddingSelections = selectedKeys.size === 0;
        for (const key of keys) {
            if (KEYMAP[key.code]) {
                toggleSelection(key.code);
                await tick();
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
    const selectedKeysRapidTrigger = $derived(
        getCommonValue([...selectedKeys.values().map((key) => keys[key].rapidTrigger)]),
    );
    const selectedKeysRTPressSensitivity = $derived(
        getCommonValue([
            ...selectedKeys.values().map((key) => keys[key].rapidTriggerPressSensitivity),
        ]),
    );
    const selectedKeysRTReleaseSensitivity = $derived(
        getCommonValue([
            ...selectedKeys.values().map((key) => keys[key].rapidTriggerReleaseSensitivity),
        ]),
    );
</script>

<svelte:window onmouseup={() => (dragStartTime = null)} />

<div class="min-h-30">
    {#if selectedKeys.size !== 0}
        <div class="flex h-full w-full items-center gap-8 px-4">
            <div class="flex min-w-24 justify-center">
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
            </div>

            <div class="flex h-full flex-col gap-2 pr-4">
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

            <div class="flex h-full flex-col gap-2 border-l-2 border-stone-500 px-4">
                <h2 class="flex gap-4 text-xs font-bold uppercase">
                    Rapid Trigger
                    <ToggleSwitch
                        class="-translate-y-0.5"
                        indeterminate={selectedKeysRapidTrigger === null}
                        bind:checked={
                            () => selectedKeysRapidTrigger!,
                            (value) => {
                                if (value !== null) {
                                    onActuationChange?.();
                                    selectedKeys.forEach((key) => (keys[key].rapidTrigger = value));
                                }
                            }
                        }
                    />
                </h2>

                <h2 class="flex items-center gap-4 text-xs font-bold uppercase">
                    Separate Press/Release
                    <ToggleSwitch bind:checked={separateRTPressRelease} />
                </h2>

                <Slider
                    bind:value={
                        () => selectedKeysRTPressSensitivity,
                        (value) => {
                            onActuationChange?.();
                            selectedKeys.forEach((key) => {
                                keys[key].rapidTriggerPressSensitivity = value!;
                                if (!separateRTPressRelease)
                                    keys[key].rapidTriggerReleaseSensitivity = value!;
                            });
                        }
                    }
                    disabled={!selectedKeysRapidTrigger}
                    min={RT_MIN_SENSITIVITY}
                    max={RT_MAX_SENSITIVITY}
                    direction="press"
                />

                {#if separateRTPressRelease || selectedKeysRTPressSensitivity !== selectedKeysRTReleaseSensitivity}
                    <Slider
                        bind:value={
                            () => selectedKeysRTReleaseSensitivity,
                            (value) => {
                                onActuationChange?.();
                                selectedKeys.forEach(
                                    (key) => (keys[key].rapidTriggerReleaseSensitivity = value!),
                                );
                            }
                        }
                        disabled={!selectedKeysRapidTrigger}
                        min={RT_MIN_SENSITIVITY}
                        max={RT_MAX_SENSITIVITY}
                        direction="release"
                    />
                {/if}
            </div>
        </div>
    {:else}
        <div class="flex h-full flex-col items-center justify-center gap-2 text-center opacity-50">
            <SquareDashedMousePointerIcon />
            Select one or more keys to change options
            <br />
            Hold to select multiple keys
        </div>
    {/if}
</div>

<div
    class="grid gap-1 active:cursor-grabbing"
    style:grid-template-columns="repeat({16 * UNIT_MULTIPLIER}, 1fr)"
    style:grid-template-rows="repeat(4, 3rem)"
>
    {#each keys as key}
        {@const name = KEYMAP[key.code]}
        {#if name}
            {@const keyDef = keyDefs[name]}
            <button
                class={[
                    "font-keys relative flex items-center justify-center rounded-md bg-stone-900 p-3 select-none",
                    selectedKeys.has(key.code)
                        ? "outline-2 -outline-offset-1 outline-red-600"
                        : "focus-visible:outline-none",
                    isDragging() ? "cursor-grabbing" : "cursor-grab",
                ]}
                onmousedown={() => {
                    // Add selections if an unselected key was clicked, remove if it was a selected one
                    isAddingSelections = !selectedKeys.has(key.code);
                    dragStartTime = Date.now();
                }}
                onclick={() => {
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
                <ActuationInput
                    bind:value={key.upActuation}
                    class={[
                        "absolute -top-0 left-1/2 z-50 w-6 -translate-x-1/2 text-yellow-100",
                        !showAllActuations && "invisible",
                        isDragging() && "cursor-grabbing",
                    ]}
                />
                <ActuationInput
                    bind:value={key.downActuation}
                    class={[
                        "absolute -bottom-0 left-1/2 z-50 w-8 -translate-x-1/2 text-blue-200",
                        !showAllActuations && "invisible",
                        isDragging() && "cursor-grabbing",
                    ]}
                />
            </button>
        {/if}
    {/each}
</div>
