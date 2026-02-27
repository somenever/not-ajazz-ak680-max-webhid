<script lang="ts">
    import { CheckIcon, LoaderCircleIcon } from "@lucide/svelte";
    import type { Snippet } from "svelte";

    import Button from "$lib/components/button.svelte";

    const {
        onApply,
        busy,
        applyDisabled,
        children,
    }: {
        onApply: () => void;
        busy: boolean;
        applyDisabled: boolean;
        children?: Snippet;
    } = $props();
</script>

<div class="flex gap-2">
    <Button onclick={onApply} disabled={busy || applyDisabled} class="relative flex-1">
        {#if busy}
            <div class="absolute left-2 animate-spin">
                <LoaderCircleIcon />
            </div>
        {/if}
        <CheckIcon />Apply
    </Button>

    {@render children?.()}
</div>
