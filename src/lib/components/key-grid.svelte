<script lang="ts">
    import { KEYMAP, type Key } from "$lib/ak680max";
    import keyDefs from "$lib/keys.json";

    const { keys }: { keys: Key[] } = $props();

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
                <p
                    class="absolute -top-1 right-0 left-0 text-center text-xs text-orange-200 opacity-0 group-hover:opacity-100"
                >
                    {key.upActuation}
                </p>
                <p
                    class="absolute right-0 -bottom-1 left-0 text-center text-xs text-blue-200 opacity-0 group-hover:opacity-100"
                >
                    {key.downActuation}
                </p>
            </div>
        {/if}
    {/each}
</div>
