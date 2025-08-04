<script lang="ts">
    import { KEYMAP, type Key } from "$lib/ak680max";
    import keyDefs from "$lib/keys.json";

    const { keys }: { keys: Key[] } = $props();

    const unitMultiplier = 4;
</script>

<div class="grid gap-1" style:grid-template-columns="repeat({16 * unitMultiplier}, 1fr)" style:grid-template-rows="repeat(4, 3rem)">
    {#each keys as key}
        {@const name = KEYMAP[key.code]}
        {#if name}
            {@const keyDef = keyDefs[name]}
            <div class="flex items-center justify-center p-3 bg-stone-900 font-keys rounded-md relative group select-none" style:grid-column="{keyDef.column * unitMultiplier + 1} / span {keyDef.width * unitMultiplier}" style:grid-row={keyDef.row + 1}>
                {keyDef.name}
                <p class="absolute -top-1 left-0 right-0 text-center text-orange-200 text-xs opacity-0 group-hover:opacity-100">{key.upActuation}</p>
                <p class="absolute -bottom-1 left-0 right-0 text-center text-blue-200 text-xs opacity-0 group-hover:opacity-100">{key.downActuation}</p>
            </div>
        {/if}
    {/each}
</div>

