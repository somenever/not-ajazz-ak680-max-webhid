<script lang="ts">
    import { SvelteSet } from "svelte/reactivity";
    import IconArrowsUpDownSquare from "~icons/lucide-lab/arrows-up-down-square";
    import IconSquareDashed from "~icons/lucide/square-dashed";
    import IconSquareDashedMousePointer from "~icons/lucide/square-dashed-mouse-pointer";

    import {
        applyKeys,
        KEYMAP,
        RT_MAX_SENSITIVITY,
        RT_MIN_SENSITIVITY,
        type Key,
        type Keyboard,
    } from "$lib/ak680max";
    import keyDefs from "$lib/keys.json";
    import ActuationSlider from "$lib/components/actuation-slider.svelte";
    import ToggleSwitch from "$lib/components/toggle-switch.svelte";
    import Slider from "$lib/components/slider.svelte";
    import TabActionRow from "$lib/components/tab-action-row.svelte";
    import Tooltip from "$lib/components/tooltip.svelte";
    import IconButton from "$lib/components/icon-button.svelte";
    import ToggleButton from "$lib/components/toggle-button.svelte";
    import KeyGrid from "$lib/components/key-grid.svelte";
    import ActuationInput from "./actuation-input.svelte";

    const { keyboard }: { keyboard: Keyboard } = $props();

    const { keys } = $derived(keyboard);

    let keyGrid = $state<KeyGrid>();

    let separateRTPressRelease = $state(false);

    let showAllActuations = $state(false);
    let hasUnsavedChanges = $state(false);

    const selectedKeys = new SvelteSet<number>();

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
                                hasUnsavedChanges = true;
                                selectedKeys.forEach((key) => (keys[key].downActuation = value));
                            }
                        }
                    }
                    bind:bottomValue={
                        () => selectedKeysUpActuation,
                        (value) => {
                            if (value) {
                                hasUnsavedChanges = true;
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
                                    hasUnsavedChanges = true;
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
                            hasUnsavedChanges = true;
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
                                hasUnsavedChanges = true;
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
            <IconSquareDashedMousePointer />
            Select one or more keys to change options
            <br />
            Hold to select multiple keys
        </div>
    {/if}
</div>

<KeyGrid {keyboard} {selectedKeys} bind:this={keyGrid}>
    {#snippet keyOverlay(key: Key)}
        <ActuationInput
            bind:value={key.upActuation}
            class={[
                "absolute -top-0 left-1/2 z-10 w-6 -translate-x-1/2 text-yellow-100",
                !showAllActuations && "invisible",
                keyGrid?.isDragging?.() && "cursor-grabbing",
            ]}
        />
        <ActuationInput
            bind:value={key.downActuation}
            class={[
                "absolute -bottom-0 left-1/2 z-10 w-8 -translate-x-1/2 text-blue-200",
                !showAllActuations && "invisible",
                keyGrid?.isDragging?.() && "cursor-grabbing",
            ]}
        />
    {/snippet}
</KeyGrid>

<TabActionRow
    onApply={async () => {
        await applyKeys(keyboard);
        hasUnsavedChanges = false;
    }}
    applyDisabled={!hasUnsavedChanges}
    busy={keyboard.busy}
>
    <Tooltip label="Select all">
        <IconButton onclick={() => keyGrid!.selectAll()}>
            <IconSquareDashed />
        </IconButton>
    </Tooltip>
    <Tooltip label="Show actuation">
        <ToggleButton bind:active={showAllActuations}>
            <IconArrowsUpDownSquare />
        </ToggleButton>
    </Tooltip>
</TabActionRow>
