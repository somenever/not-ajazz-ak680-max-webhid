<script lang="ts">
    import { onMount } from "svelte";
    import IconCheck from "~icons/lucide/check";
    import IconDot from "~icons/lucide/dot";
    import IconPencilLine from "~icons/lucide/pencil-line";
    import IconTriangleAlert from "~icons/lucide/triangle-alert";
    import IconZap from "~icons/lucide/zap";

    import { nullOf } from "$lib";
    import { storable } from "$lib/storable";
    import {
        connectKeyboard,
        findKeyboardConfigForDevice,
        LAYERS,
        setLayer,
        type Keyboard,
    } from "$lib/keyboard";
    import Button from "$lib/components/button.svelte";
    import KeyOptionsTab from "$lib/components/key-options-tab.svelte";
    import Popup from "$lib/components/popup.svelte";
    import IconButton from "$lib/components/icon-button.svelte";
    import Textbox from "$lib/components/textbox.svelte";
    import Tooltip from "$lib/components/tooltip.svelte";
    import githubLogo from "$lib/assets/github.svg";

    let showDisclaimer = $state(false);
    let showUnsupportedBrowser = $state(false);
    let errorMessage = $state(nullOf<string>());

    let layerNames = storable<string[]>("layerNames", []);
    let editLayerNamesPopup = $state(false);

    let keyboard = $state(nullOf<Keyboard>());

    onMount(() => {
        setTimeout(() => (showDisclaimer = true), 100);

        if (!("hid" in navigator)) return;

        const callback = (event: HIDConnectionEvent) => {
            if (findKeyboardConfigForDevice(event.device)) {
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
        <h1 class="text-2xl font-bold">Not AJAZZ AK680 MAX Web Utility</h1>
        <p class="mb-2">
            A web-based configuration software for the AJAZZ AK680 MAX keyboard (and a few others),
            built with WebHID. Works on Linux, macOS, and Windows. Configure actuation, rapid
            trigger, and layers. Connect your totally-not-a-keyboard by pressing the button below.
        </p>
        <Button
            onclick={async () => {
                if (!("hid" in navigator)) {
                    showUnsupportedBrowser = true;
                    return;
                }

                try {
                    keyboard = await connectKeyboard();
                } catch (err) {
                    console.error(err);
                    errorMessage =
                        err instanceof Error ? err.message : "Couldn't connect to keyboard";
                }
            }}
        >
            <IconZap />Connect
        </Button>
    </div>
{:else}
    <div class="flex max-w-240 flex-1 flex-col gap-4 p-4">
        <div
            class="flex w-full flex-col gap-2 rounded-2xl bg-stone-800 p-4 shadow-md shadow-black/50"
        >
            <h2 class="text-xl font-bold">{keyboard.config.name}</h2>
            <div class="flex gap-6">
                <p class="text-green-400">Connected</p>
            </div>
        </div>

        {#if keyboard.config.features.includes("layers")}
            <div class="flex flex-col gap-2 rounded-2xl bg-stone-800 p-4 shadow-md shadow-black/50">
                <h2 class="text-lg font-semibold">Layers</h2>
                <div class="flex flex-wrap gap-2">
                    {#each LAYERS as layer}
                        <Button onclick={() => setLayer(keyboard!, layer)} disabled={keyboard.busy}>
                            {#if keyboard!.activeLayer === layer}
                                <IconCheck />
                            {/if}
                            {$layerNames[layer] ?? `Layer ${layer + 1}`}
                        </Button>
                    {/each}
                    <Tooltip label="Rename layers">
                        <IconButton onclick={() => (editLayerNamesPopup = true)}>
                            <IconPencilLine />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
        {/if}

        <div class="flex flex-col gap-4 rounded-2xl bg-stone-800 p-4 shadow-md shadow-black/50">
            <KeyOptionsTab {keyboard} />
        </div>
    </div>
{/if}

<div class="flex-1"></div>

<footer class="flex items-center justify-center p-4">
    <span class="text-sm opacity-50">
        made with <span class="text-red-600">❤️</span>
        by someever
    </span>
    <IconDot class="opacity-50" />
    <span class="text-sm opacity-50">not affiliated with or endorsed by ajazz</span>
    <IconDot class="opacity-50" />
    <a
        href="https://github.com/somenever/not-ajazz-ak680-max-webhid"
        target="_blank"
        rel="noreferrer"
    >
        <img src={githubLogo} alt="GitHub logo" class="h-4 w-4" />
    </a>
</footer>

{#if showUnsupportedBrowser}
    <Popup
        modal
        close={() => (showUnsupportedBrowser = false)}
        class="flex max-w-140 flex-col gap-3 p-6"
    >
        <h2 class="flex flex-col items-center gap-2 text-xl font-bold">
            <IconTriangleAlert class="size-12" />
            Unsupported Browser
        </h2>
        <p class="mb-4">
            Your browser does not support WebHID, which is required for this utility to function.
            Please use a web browser that supports the WebHID API, such as Chrome or Edge.
        </p>
        <Button onclick={() => (showUnsupportedBrowser = false)}>
            <IconCheck />OK
        </Button>
    </Popup>
{/if}

{#if showDisclaimer}
    <Popup
        modal
        close={() => (showDisclaimer = false)}
        class="flex max-w-140 flex-col gap-3 p-6"
        data-nosnippet
    >
        <h2 class="flex flex-col items-center gap-2 text-xl font-bold">
            <IconTriangleAlert class="size-12" />
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
            <IconCheck />I understand
        </Button>
    </Popup>
{/if}

{#if errorMessage}
    <Popup modal close={() => (errorMessage = null)} class="flex max-w-140 flex-col gap-3 p-6">
        <h2 class="flex flex-col items-center gap-2 text-xl font-bold">
            <IconTriangleAlert class="size-12" />
            Error
        </h2>
        <p class="mb-4">
            {errorMessage}
        </p>
        <Button onclick={() => (errorMessage = null)}>
            <IconCheck />OK
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
            <IconPencilLine class="size-12" />
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
                <IconCheck />OK
            </Button>
        </form>
    </Popup>
{/if}
