<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    const {
        children,
        class: clazz = "",
        disabled,
        ...props
    }: {
        children: Snippet;
        disabled?: boolean;
        class?: string;
    } & HTMLButtonAttributes = $props();
</script>

<button
    type="submit"
    class={[
        "flex cursor-default items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white hover:brightness-90 active:brightness-80",
        "outline-offset-2 outline-red-600 transition-[scale,background,filter] focus-visible:outline-2 active:scale-[98%]",
        disabled && "cursor-not-allowed opacity-50",
        clazz,
    ]}
    {disabled}
    {...props}
>
    {@render children()}
</button>
