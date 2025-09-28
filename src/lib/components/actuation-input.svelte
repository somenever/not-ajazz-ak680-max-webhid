<script lang="ts">
    import { MAX_ACTUATION, MIN_ACTUATION } from "$lib/ak680max";

    let {
        class: clazz = "",
        disabled = false,
        onActuationChange,
        value = $bindable(0),
    }: {
        class?: any[] | string;
        disabled?: boolean;
        onActuationChange?: () => void;
        value: number;
    } = $props();

    function validateActuation(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.valueAsNumber < Number(target.min)) {
            target.value = target.min;
        } else if (target.valueAsNumber > Number(target.max)) {
            target.value = target.max;
        }
    }
</script>

<input
    class={[
        "rounded-xs border-none text-center text-[0.6rem] outline-red-600/70 focus:outline-4 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        ...(typeof clazz === "string" ? [clazz] : clazz),
    ]}
    type="number"
    min={MIN_ACTUATION}
    max={MAX_ACTUATION}
    step={0.01}
    oninput={onActuationChange}
    onchange={validateActuation}
    onmousedown={(e) => e.stopPropagation()}
    onclick={(e) => e.stopPropagation()}
    {disabled}
    bind:value
/>
