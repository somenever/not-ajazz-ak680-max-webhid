import { assert } from "$lib";

export const FILTER_AK680_MAX = { vendorId: 0x3151, productId: 0x502c };
export const LAYERS = [0, 1, 2, 3] as const;

const CHUNK_COUNT = 4;

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

export function setKeyActuationPreparePayload(
    index: number,
): Uint8Array<ArrayBuffer> {
    // prettier-ignore
    return new Uint8Array([
        0x65, 0x07, 0x01, index, 0x00, 0x00, 0x00, 0x92 - index, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
    ]);
}

export function setKeyActuationEndForDirectionPayload(
    direction: "up" | "down",
): Uint8Array<ArrayBuffer> {
    const isUp = direction === "up" ? 0x01 : 0x00;
    // prettier-ignore
    return new Uint8Array([
        0x65, isUp, 0x01, 4, isUp, 0x00, 0x00, 0x99 - 4 - isUp * 2, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
    ]);
}

export function setKeyActuationChunkPayload(
    chunk: number,
    keys: Key[],
    direction: "up" | "down",
): Uint8Array<ArrayBuffer> {
    const isUp = direction === "up" ? 0x01 : 0x00;
    const keysActuation = keys.map((key) =>
        Math.floor((isUp ? key.upActuation : key.downActuation) * 100),
    );
    assert(keysActuation.length <= 28, "a chunk can only have 28 keys");
    if (keysActuation.length < 28) {
        const oldLength = keysActuation.length;
        keysActuation.length = 28;
        keysActuation.fill(0, oldLength, -1);
    }
    console.log(keysActuation);
    // prettier-ignore
    return new Uint8Array([
        0x65, isUp, 0x01, chunk, 0x00, 0x00, 0x00, 0x99 - chunk - isUp, ...new Uint8Array(new Uint16Array(keysActuation).buffer),
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
    "equal",
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

    for (const direction of ["down", "up"] as const) {
        console.debug(direction);
        for (let chunk = 0; chunk < CHUNK_COUNT; chunk++) {
            console.debug("CHUNK", chunk);
            await send(
                device,
                getActiveLayerKeysActuationChunkPayload(chunk, direction),
            );
            const payload = await receive(device);
            new Uint16Array(payload.buffer).forEach((actuation, index) => {
                const key = keys[chunk * 32 + index];
                if (direction === "down") {
                    key.downActuation = actuation / 100;
                } else {
                    key.upActuation = actuation / 100;
                }
            });
        }
    }

    return keys;
}

export async function applyKeys(keyboard: Keyboard): Promise<void> {
    await send(keyboard.device, setKeyActuationPreparePayload(0));
    await send(keyboard.device, setKeyActuationPreparePayload(1));
    await send(keyboard.device, setKeyActuationPreparePayload(2));

    for (const direction of ["down", "up"] as const) {
        for (let chunk = 0; chunk < CHUNK_COUNT; chunk++) {
            await send(
                keyboard.device,
                setKeyActuationChunkPayload(
                    chunk,
                    keyboard.keys.slice(chunk * 28, (chunk + 1) * 28),
                    direction,
                ),
            );
        }
        await send(
            keyboard.device,
            setKeyActuationEndForDirectionPayload(direction),
        );
    }
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
