<script lang="ts">
    import { clsx } from "clsx";

    let { indeterminate = false, checked = $bindable(false), class: clazz = "" } = $props();
</script>

<div class={clsx("relative h-5 w-10", clazz)}>
    <input
        type="checkbox"
        class={clsx(
            "absolute inset-0 cursor-pointer appearance-none rounded-full",
            "outline-offset-2 outline-red-600 focus-visible:outline-2",
            indeterminate ? "bg-stone-700" : checked ? "bg-red-600" : "bg-stone-900",
        )}
        {indeterminate}
        bind:checked
    />
    <div
        class={clsx(
            "pointer-events-none absolute top-1 h-3 w-3 rounded-full bg-white",
            indeterminate ? "left-1/2 -translate-x-1/2" : checked ? "right-1" : "left-1",
        )}
    ></div>
</div>
