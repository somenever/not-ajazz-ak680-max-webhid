<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    const {
        children,
        class: clazz = "",
        accent = true,
        ...props
    }: {
        children: Snippet;
        class?: string;
        accent?: boolean;
    } & HTMLButtonAttributes = $props();
</script>

<button
    type="submit"
    class={[
        "flex cursor-default items-center justify-center gap-2 rounded-md px-4 py-2 text-white",
        "outline-offset-2 outline-red-700 focus-visible:outline-2 active:scale-[98%] transition-[scale,background]",
        accent ? "bg-red-700 hover:bg-red-600 active:bg-red-500" : "hover:brightness-90 active:brightness-95",
        clazz
    ]}
    {...props}
>
    {@render children()}
</button>

