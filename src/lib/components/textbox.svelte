<script lang="ts">
    import { clsx } from "clsx";
    import type { HTMLInputAttributes } from "svelte/elements";

    let {
        value = $bindable(),
        focused = $bindable(),
        invalid,
        class: clazz,
        ...props
    }: { invalid?: boolean; focused?: boolean; value?: string } & HTMLInputAttributes = $props();
</script>

<input
    class={clsx(
        "rounded-lg border-2 border-stone-500 bg-none px-2 py-1",
        "outline-offset-2 outline-red-600 focus-visible:outline-2",
        clazz,
    )}
    type="text"
    bind:value
    bind:focused
    {...props}
/>
