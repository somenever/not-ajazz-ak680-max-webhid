import { assert } from "$lib";

export const FILTER_AK680_MAX = { vendorId: 0x3151, productId: 0x502c };
export const LAYERS = [0, 1, 2, 3] as const;

export type Keyboard = {
    firmwareID: number;
    activeLayer: Layer;
    device: HIDDevice;
    keys: Key[];
};
export type Layer = (typeof LAYERS)[number];

const isLayer = (layer: any): layer is Layer => LAYERS.includes(layer);

export function setLayerPayload(layer: Layer): Uint8Array<ArrayBuffer> {
    const layerMagicByte = [0xfb, 0xfa, 0xf9, 0xf8][layer];
    // prettier-ignore
    return new Uint8Array([
        0x04, layer, 0x00, 0x00, 0x00, 0x00, 0x00, layerMagicByte, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
    ]);
}

export const getLayerPayload = new Uint8Array([
    0x84, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7b, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
]);

export const getFirmwarePayload = new Uint8Array([
    0x8f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x70, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
]);

export function getActiveLayerKeysActuationChunkPayload(
    chunk: number,
    direction: "up" | "down",
): Uint8Array<ArrayBuffer> {
    const isUp = direction === "up" ? 0x01 : 0x00;
    // prettier-ignore
    return new Uint8Array([
        0xe5, isUp, 0x01, chunk, 0x00, 0x00, 0x00, 0x19 - chunk - isUp, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
    ]);
}

export async function send(
    device: HIDDevice,
    payload: Uint8Array<ArrayBuffer>,
): Promise<void> {
    await device.sendFeatureReport(0, payload);
    console.debug("sent payload to device!", payload);
}

async function receive(device: HIDDevice) {
    const payload = await device.receiveFeatureReport(0);
    console.debug("received payload from device!", payload);
    return payload;
}

async function getActiveLayer(device: HIDDevice): Promise<Layer> {
    await send(device, getLayerPayload);
    const payload = await receive(device);
    const layer = payload.getUint8(1);
    assert(isLayer(layer), `expected valid layer, got ${layer}`);
    return layer;
}

async function getFirmwareID(device: HIDDevice): Promise<number> {
    await send(device, getFirmwarePayload);
    const payload = await receive(device);
    return payload.getUint16(1, true);
}

export const KEYMAP = [
    "esc",
    "tab",
    "capslock",
    "shift",
    "ctrl",
    "",
    "one",
    "q",
    "a",
    "",
    "",
    "",
    "two",
    "w",
    "s",
    "z",
    "win",
    "",
    "three",
    "e",
    "d",
    "x",
    "alt",
    "",
    "four",
    "r",
    "f",
    "c",
    "",
    "",
    "five",
    "t",
    "g",
    "v",
    "",
    "",
    "six",
    "y",
    "h",
    "b",
    "spacebar",
    "",
    "seven",
    "u",
    "j",
    "n",
    "",
    "",
    "eight",
    "i",
    "k",
    "m",
    "",
    "",
    "nine",
    "o",
    "l",
    "comma",
    "ralt",
    "",
    "zero",
    "p",
    "semicolon",
    "dot",
    "fn",
    "",
    "minus",
    "leftbracket",
    "apostrophe",
    "slash",
    "rctrl",
    "",
    "plus",
    "rightbracket",
    "",
    "rshift",
    "left",
    "",
    "backspace",
    "backslash",
    "enter",
    "up",
    "down",
    "",
    "home",
    "del",
    "pgup",
    "pgdown",
    "right",
] as const;

export type Key = {
    code: number;
    downActuation: number;
    upActuation: number;
};

export async function getKeys(device: HIDDevice): Promise<Key[]> {
    console.debug("sending layer keys payload");

    const keys: Key[] = [];
    for (let key = 0; key < 128; key++) {
        keys[key] = {
            code: key,
            downActuation: 0,
            upActuation: 0,
        };
    }

    console.debug("DOWN");
    for (let chunk = 0; chunk < 4; chunk++) {
        console.debug("CHUNK", chunk);
        await send(
            device,
            getActiveLayerKeysActuationChunkPayload(chunk, "down"),
        );
        const payload = await receive(device);
        new Uint16Array(payload.buffer).forEach((key, index) => {
            keys[chunk * 32 + index].downActuation = key / 100;
        });
    }

    console.debug("UP");
    for (let chunk = 0; chunk < 4; chunk++) {
        console.debug("CHUNK", chunk);
        await send(
            device,
            getActiveLayerKeysActuationChunkPayload(chunk, "up"),
        );
        const payload = await receive(device);
        new Uint16Array(payload.buffer).forEach((key, index) => {
            keys[chunk * 32 + index].upActuation = key / 100;
        });
    }

    return keys;
}

export const isAk680MaxVendorControl = (device: HIDDevice): boolean =>
    device.productId === FILTER_AK680_MAX.productId &&
    device.vendorId === FILTER_AK680_MAX.vendorId &&
    device.collections[0]?.usagePage === 0xffff;

export async function connectKeyboard(): Promise<Keyboard> {
    const devices = await navigator.hid.requestDevice({
        filters: [FILTER_AK680_MAX],
    });
    console.debug("got devices:", devices);
    const device = devices.find(isAk680MaxVendorControl);
    if (!device) {
        throw new Error("no AK680 MAX found!");
    }

    console.debug("found the right device!", device);
    await device.open();
    console.debug("opened the device!");

    const keyboard = {
        firmwareID: await getFirmwareID(device),
        activeLayer: await getActiveLayer(device),
        keys: await getKeys(device),
        device,
    };

    return keyboard;
}
