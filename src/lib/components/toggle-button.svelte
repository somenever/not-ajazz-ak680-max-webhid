<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    let {
        children,
        class: clazz = "",
        active = $bindable(false),
        onclick = () => {},
        ...props
    }: {
        children: Snippet;
        class?: string;
        active: boolean;
    } & HTMLButtonAttributes = $props();
</script>

<button
    class={[
        "cursor-default rounded-lg border-none p-2 outline-offset-2 outline-red-600 focus-visible:outline-2",
        "transition-[colors,scale] active:scale-[97%]",
        active ? "bg-white/5 hover:bg-white/10" : "hover:bg-white/10",
        clazz,
    ]}
    onclick={() => (active = !active)}
    {...props}
>
    {@render children()}
</button>
