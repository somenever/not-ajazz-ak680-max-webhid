<script lang="ts">
    import { nullOf } from "$lib";
    import {
        connectKeyboard,
        getKeys,
        isAk680MaxVendorControl,
        LAYERS,
        send,
        setLayerPayload,
        type Keyboard,
    } from "$lib/ak680max";
    import Button from "$lib/components/button.svelte";
    import KeyGrid from "$lib/components/key-grid.svelte";
    import { CheckIcon, ZapIcon } from "@lucide/svelte";

    let keyboard = $state(nullOf<Keyboard>());
    let processingUserLock = $state(false);

    $effect(() => {
        const callback = (event: HIDConnectionEvent) => {
            if (isAk680MaxVendorControl(event.device)) {
                keyboard = null;
            }
        };

        navigator.hid.addEventListener("disconnect", callback);
        return () => {
            if (keyboard) {
                keyboard.device.close();
            }
            navigator.hid.removeEventListener("disconnect", callback);
        };
    });
</script>

{#if !keyboard}
    <div class="bg-stone-800 p-8 rounded-2xl shadow-black/50 shadow-md max-w-140 flex flex-col gap-4">
        <h1 class="text-2xl font-bold">Welcome to the Not AJAZZ AK680 MAX Web Utility</h1>
        <p class="mb-6">Connect your not-a-keyboard by pressing the button below</p>
        <Button onclick={async () => {
            keyboard = await connectKeyboard();
        }}>
            <ZapIcon />Connect
        </Button>
    </div>
{:else}
    <div class="flex flex-col p-4 max-w-240 gap-4">
        <div class="flex flex-col gap-2 w-full bg-stone-800 p-4 rounded-2xl shadow-black/50 shadow-md">
            <h2 class="text-xl font-bold">AJAZZ AK680 MAX</h2>
            <div class="flex gap-6">
                <p class="text-green-400">Connected</p>
                <p class="opacity-50">ID: {keyboard.firmwareID}</p>
            </div>
        </div>

        <div class="flex flex-col gap-2 bg-stone-800 p-4 rounded-2xl shadow-black/50 shadow-md">
            <h2 class="text-lg font-semibold">Layers</h2>
            <div class="flex gap-2 flex-wrap">
                {#each LAYERS as layer}
                    <Button
                        onclick={async () => {
                            processingUserLock = true;
                            await send(keyboard!.device, setLayerPayload(layer));
                            keyboard!.activeLayer = layer;

                            setTimeout(async () => {
                                keyboard!.keys = await getKeys(keyboard!.device);
                                processingUserLock = false;
                            }, 500);
                        }}
                        disabled={processingUserLock}
                    >
                        {#if keyboard!.activeLayer === layer}
                            <CheckIcon />
                        {/if}
                        Layer {layer + 1}
                    </Button>
                {/each}
            </div>
        </div>

        <div class="bg-stone-800 p-4 rounded-2xl shadow-black/50 shadow-md">
            <KeyGrid keys={keyboard.keys} />
        </div>
    </div>
{/if}

