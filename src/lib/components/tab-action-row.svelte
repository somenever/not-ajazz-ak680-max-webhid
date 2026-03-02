<script lang="ts">
    import type { Snippet } from "svelte";
    import IconCheck from "~icons/lucide/check";
    import IconLoaderCircle from "~icons/lucide/loader-circle";

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
                <IconLoaderCircle />
            </div>
        {/if}
        <IconCheck />Apply
    </Button>

    {@render children?.()}
</div>
