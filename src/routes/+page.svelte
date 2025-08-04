<script lang="ts">
    import { ArrowRightIcon, CheckIcon, TriangleAlertIcon, ZapIcon } from "@lucide/svelte";

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
    import Popup from "$lib/components/popup.svelte";

    let showDisclaimer = $state(true);
    let showUnsupportedKeyboard = $state(false);
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
            if (keyboard.firmwareID !== 2317) {
                showUnsupportedKeyboard = true;
            }
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

{#if showDisclaimer}
<Popup
    modal
    close={() => showDisclaimer = false}
    class="flex flex-col p-6 gap-3 max-w-140"
>
    <h2 class="flex flex-col items-center gap-2 text-xl font-bold">
        <TriangleAlertIcon size={48} />
        Disclaimer
    </h2>
    <p class="mb-4">
        This is experimental software. Using it will void any and all warranties
        from Ajazz Electronic Technology Co., Ltd. or any other entity. This software may
        permanently damage your keyboard. By proceeding you assume all risk and
        agree to hold harmless its author, the copyright holder, and any and all
        other entities.
    </p>
    <Button onclick={() => showDisclaimer = false}>
        <CheckIcon />I understand
    </Button>
</Popup>
{/if}

{#if showUnsupportedKeyboard}
<Popup
    modal
    close={() => showUnsupportedKeyboard = false}
    class="flex flex-col p-6 gap-3 max-w-140"
>
    <h2 class="flex flex-col items-center gap-2 text-xl font-bold">
        <TriangleAlertIcon size={48} />
        Unsupported Keyboard
    </h2>
    <p class="mb-4">
        This software has only been tested with the AJAZZ AK680 MAX No RGB keyboard (ID 2317).
        Your keyboard (ID {keyboard?.firmwareID ?? "unknown"}) may be different and may not work as intended.
    </p>
    <Button onclick={() => showUnsupportedKeyboard = false}>
        <ArrowRightIcon />Proceed anyway
    </Button>
</Popup>
{/if}

