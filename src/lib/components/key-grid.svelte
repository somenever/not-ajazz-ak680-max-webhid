<script lang="ts">
    import { KEYMAP, type Key } from "$lib/ak680max";
    import keyLabels from "$lib/keys.json";

    const { keys }: { keys: Key[] } = $props();
</script>

<div class="grid gap-1">
    {#each keys as key}
        {@const name = KEYMAP[key.code]}
        {#if name}
            <div class="flex items-center justify-center p-3 bg-stone-900 font-keys rounded-md relative group select-none" style:grid-area={name}>
                {keyLabels[name]}
                <p class="absolute -top-1 left-0 right-0 text-center text-orange-200 text-xs opacity-0 group-hover:opacity-100">{key.upActuation}</p>
                <p class="absolute -bottom-1 left-0 right-0 text-center text-blue-200 text-xs opacity-0 group-hover:opacity-100">{key.downActuation}</p>
            </div>
        {/if}
    {/each}
</div>

<style>
    .grid {
        grid-template-areas:
            "esc one two three four five six seven eight nine zero minus plus backspace backspace home"
            "tab tab q w e r t y u i o p leftbracket rightbracket backslash del"
            "capslock capslock a s d f g h j k l semicolon apostrophe enter enter pgup"
            "shift shift z x c v b n m comma dot slash rshift rshift up pgdown"
            "ctrl win alt spacebar spacebar spacebar spacebar spacebar spacebar spacebar ralt fn rctrl left down right";
        grid-template-columns: repeat(16, 3rem);
    }
</style>

