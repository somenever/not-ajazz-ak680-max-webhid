<script lang="ts">
    import { CheckIcon } from "@lucide/svelte";
    import type { Snippet } from "svelte";

    import Button from "$lib/components/button.svelte";

    const {
        applyDisabled,
        onApply,
        children,
    }: {
        applyDisabled: boolean;
        onApply: () => Promise<void>;
        children?: Snippet;
    } = $props();
</script>

<div class="flex gap-2">
    <Button onclick={() => onApply()} disabled={applyDisabled} class="flex-1">
        <CheckIcon />Apply
    </Button>

    {@render children?.()}
</div>
