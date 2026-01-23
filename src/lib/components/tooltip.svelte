<script lang="ts">
    import type { Snippet } from "svelte";

    const { children, label }: { children: Snippet; label: string } = $props();
</script>

<div class="group relative">
    {@render children()}

    <div
        class="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-50 w-max -translate-x-1/2 rounded-md border border-stone-700 bg-stone-800 px-2 py-1 opacity-0 shadow-md shadow-black/25 transition-opacity group-hover:opacity-100"
    >
        {label}
    </div>
</div>
