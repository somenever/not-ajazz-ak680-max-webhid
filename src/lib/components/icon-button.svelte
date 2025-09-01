<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    let {
        children,
        class: clazz = "",
        ...props
    }: {
        children: Snippet;
        class?: string;
    } & HTMLButtonAttributes = $props();
</script>

<button
    class={[
        "cursor-default rounded-lg border-none p-2 outline-offset-2 outline-red-600 focus-visible:outline-2",
        "transition-[colors,scale] hover:bg-white/10 active:scale-[97%] active:bg-white/15",
        clazz,
    ]}
    {...props}
>
    {@render children()}
</button>
