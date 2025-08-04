<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    const {
        children,
        class: clazz = "",
        ...props
    }: {
        children: Snippet;
        class?: string;
    } & HTMLButtonAttributes = $props();
</script>

<button
    type="submit"
    class={[
        "flex cursor-default items-center justify-center gap-2 rounded-md px-4 py-2 text-white",
        "outline-offset-2 outline-red-600 focus-visible:outline-2 active:scale-[98%] transition-[scale,background,filter]",
        "bg-red-600 hover:brightness-90 active:brightness-80",
        clazz
    ]}
    {...props}
>
    {@render children()}
</button>

