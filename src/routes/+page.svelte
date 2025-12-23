<script lang="ts">
    import {
        ArrowRightIcon,
        CheckIcon,
        DotIcon,
        Icon,
        PencilLineIcon,
        SquareDashedIcon,
        TriangleAlertIcon,
        ZapIcon,
    } from "@lucide/svelte";
    import { arrowsUpDownSquare } from "@lucide/lab";
    import { onMount } from "svelte";

    import { nullOf } from "$lib";
    import { storable } from "$lib/storable";
    import {
        applyKeys,
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
    import ToggleButton from "$lib/components/toggle-button.svelte";
    import IconButton from "$lib/components/icon-button.svelte";
    import Textbox from "$lib/components/textbox.svelte";
    import githubLogo from "$lib/assets/github.svg";

    let showDisclaimer = $state(true);
    let showUnsupportedKeyboard = $state(false);
    let showApplyKeysButton = $state(false);
    let showAllActuations = $state(false);

    let layerNames = storable<string[]>("layerNames", []);
    let editLayerNamesPopup = $state(false);

    let keyGrid: KeyGrid;

    /*
    const keys: Key[] = [];
    for (let key = 0; key < 128; key++) {
        keys[key] = {
            code: key,
            downActuation: 0.2,
            upActuation: 2.8,
        };
    }
    */
    //let keyboard = $state(<Keyboard | null>{ keys });
    let keyboard = $state(nullOf<Keyboard>());
    let processingUserLock = $state(false);

    onMount(() => {
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

<div class="flex-1"></div>

{#if !keyboard}
    <div
        class="flex max-w-140 flex-col gap-4 rounded-2xl bg-stone-800 p-8 shadow-md shadow-black/50"
    >
        <h1 class="text-2xl font-bold">Welcome to the Not AJAZZ AK680 MAX Web Utility</h1>
        <p class="mb-2">
            A browser-based WebHID configurator for the AJAZZ AK680 MAX keyboard. Works on Linux,
            macOS, and Windows. Configure actuation, rapid trigger, and layers. Connect your
            totally-not-a-keyboard by pressing the button below.
        </p>
        <Button
            onclick={async () => {
                keyboard = await connectKeyboard();
                if (keyboard.firmwareID !== 2317) {
                    showUnsupportedKeyboard = true;
                }
            }}
        >
            <ZapIcon />Connect
        </Button>
    </div>
{:else}
    <div class="flex max-w-240 flex-1 flex-col gap-4 p-4">
        <div
            class="flex w-full flex-col gap-2 rounded-2xl bg-stone-800 p-4 shadow-md shadow-black/50"
        >
            <h2 class="text-xl font-bold">AJAZZ AK680 MAX</h2>
            <div class="flex gap-6">
                <p class="text-green-400">Connected</p>
                <p class="opacity-50">ID: {keyboard.firmwareID}</p>
            </div>
        </div>

        <div class="flex flex-col gap-2 rounded-2xl bg-stone-800 p-4 shadow-md shadow-black/50">
            <h2 class="text-lg font-semibold">Layers</h2>
            <div class="flex flex-wrap gap-2">
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
                        {$layerNames[layer] ?? `Layer ${layer + 1}`}
                    </Button>
                {/each}
                <IconButton onclick={() => (editLayerNamesPopup = true)}>
                    <PencilLineIcon />
                </IconButton>
            </div>
        </div>

        <div class="flex flex-col gap-4 rounded-2xl bg-stone-800 p-4 shadow-md shadow-black/50">
            <KeyGrid
                bind:this={keyGrid}
                bind:keys={keyboard.keys}
                onActuationChange={() => (showApplyKeysButton = true)}
                {showAllActuations}
            />
            <div class="flex gap-2">
                <Button
                    onclick={async () => {
                        processingUserLock = true;
                        console.debug(keyboard!.keys);
                        await applyKeys(keyboard!);
                        processingUserLock = false;
                    }}
                    disabled={processingUserLock || !showApplyKeysButton}
                    class="flex-1"
                >
                    <CheckIcon />Apply
                </Button>
                <IconButton onclick={() => keyGrid?.selectAll()}>
                    <SquareDashedIcon />
                </IconButton>
                <ToggleButton bind:active={showAllActuations}>
                    <Icon iconNode={arrowsUpDownSquare} />
                </ToggleButton>
            </div>
        </div>
    </div>
{/if}

<div class="flex-1"></div>

<footer class="flex items-center justify-center p-4">
    <span class="text-sm opacity-50">
        made with <span class="text-red-600">❤️</span>
        by someever
    </span>
    <DotIcon class="opacity-50" />
    <span class="text-sm opacity-50">not affiliated with or endorsed by ajazz</span>
    <DotIcon class="opacity-50" />
    <a
        href="https://github.com/somenever/not-ajazz-ak680-max-webhid"
        target="_blank"
        rel="noreferrer"
    >
        <img src={githubLogo} alt="GitHub logo" class="h-4 w-4" />
    </a>
</footer>

{#if showDisclaimer}
    <Popup modal close={() => (showDisclaimer = false)} class="flex max-w-140 flex-col gap-3 p-6">
        <h2 class="flex flex-col items-center gap-2 text-xl font-bold">
            <TriangleAlertIcon size={48} />
            Disclaimer
        </h2>
        <p class="mb-4">
            This is experimental software. Using it will void any and all warranties from Ajazz
            Electronic Technology Co., Ltd. or any other entity. This software may permanently
            damage your keyboard. By proceeding you assume all risk and agree to hold harmless its
            author, the copyright holder, and any and all other entities. (Realistically, it
            probably won’t damage your keyboard, but the warning still stands.)
        </p>
        <Button onclick={() => (showDisclaimer = false)}>
            <CheckIcon />I understand
        </Button>
    </Popup>
{/if}

{#if showUnsupportedKeyboard}
    <Popup
        modal
        close={() => (showUnsupportedKeyboard = false)}
        class="flex max-w-140 flex-col gap-3 p-6"
    >
        <h2 class="flex flex-col items-center gap-2 text-xl font-bold">
            <TriangleAlertIcon size={48} />
            Unsupported Keyboard
        </h2>
        <p class="mb-4">
            This software has only been tested with the AJAZZ AK680 MAX No RGB keyboard (ID 2317).
            Your keyboard (ID {keyboard?.firmwareID ?? "unknown"}) may be different and may not work
            as intended.
        </p>
        <Button onclick={() => (showUnsupportedKeyboard = false)}>
            <ArrowRightIcon />Proceed anyway
        </Button>
    </Popup>
{/if}

{#if editLayerNamesPopup}
    <Popup
        modal
        close={() => (editLayerNamesPopup = false)}
        class="flex max-w-140 flex-col gap-4 p-6"
    >
        <h2 class="flex flex-col items-center gap-2 text-xl font-bold">
            <PencilLineIcon size={48} />
            Layer names
        </h2>
        <form class="flex flex-col gap-2">
            {#each LAYERS as layer}
                <Textbox
                    bind:value={
                        () => $layerNames[layer] ?? `Layer ${layer + 1}`,
                        (value) => ($layerNames[layer] = value)
                    }
                />
            {/each}

            <Button class="mt-4" onclick={() => (editLayerNamesPopup = false)}>
                <CheckIcon />OK
            </Button>
        </form>
    </Popup>
{/if}
