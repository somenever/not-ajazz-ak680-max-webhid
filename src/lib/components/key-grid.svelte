<script lang="ts">
    import { KEYMAP, type Key } from "$lib/ak680max";
    import keyDefs from "$lib/keys.json";

    const {
        showAllActuations,
        onActuationChange,
        keys,
    }: { showAllActuations?: boolean; onActuationChange?: () => void; keys: Key[] } = $props();

    function validateActuation(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.valueAsNumber < Number(target.min)) {
            target.value = target.min;
        } else if (target.valueAsNumber > Number(target.max)) {
            target.value = target.max;
        }
    }

    const unitMultiplier = 4;
</script>

<div
    class="grid gap-1"
    style:grid-template-columns="repeat({16 * unitMultiplier}, 1fr)"
    style:grid-template-rows="repeat(4, 3rem)"
>
    {#each keys as key}
        {@const name = KEYMAP[key.code]}
        {#if name}
            {@const keyDef = keyDefs[name]}
            <div
                class="font-keys group relative flex items-center justify-center rounded-md bg-stone-900 p-3 select-none"
                style:grid-column="{keyDef.column * unitMultiplier + 1} / span {keyDef.width *
                    unitMultiplier}"
                style:grid-row={keyDef.row + 1}
            >
                {keyDef.name}
                <input
                    class={[
                        "absolute -top-0 left-1/2 z-50 w-6 -translate-x-1/2 rounded-xs border-none text-center text-[0.6rem] text-yellow-100 outline-red-600/70 group-hover:opacity-100 focus:outline-4 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                        !showAllActuations && "opacity-0",
                    ]}
                    type="number"
                    min={0.1}
                    max={3.2}
                    step={0.01}
                    oninput={onActuationChange}
                    onchange={validateActuation}
                    bind:value={key.upActuation}
                />
                <input
                    class={[
                        "absolute -bottom-0 left-1/2 z-50 w-8 -translate-x-1/2 rounded-xs border-none text-center text-[0.6rem] text-blue-200 outline-red-600/70 group-hover:opacity-100 focus:outline-4 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                        !showAllActuations && "opacity-0",
                    ]}
                    type="number"
                    min={0.1}
                    max={3.2}
                    step={0.01}
                    oninput={onActuationChange}
                    onchange={validateActuation}
                    bind:value={key.downActuation}
                />
            </div>
        {/if}
    {/each}
</div>
