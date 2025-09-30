import { assert } from "$lib";

export const FILTER_AK680_MAX = { vendorId: 0x3151, productId: 0x502c };
export const LAYERS = [0, 1, 2, 3] as const;

export const MIN_ACTUATION = 0.1;
export const MAX_ACTUATION = 3.2;

export const RT_MIN_SENSITIVITY = 0.01;
export const RT_MAX_SENSITIVITY = 2;

const CHUNK_COUNT = 4;

export type Keyboard = {
    firmwareID: number;
    activeLayer: Layer;
    device: HIDDevice;
    keys: Key[];
};
export type Layer = (typeof LAYERS)[number];

const isLayer = (layer: any): layer is Layer => LAYERS.includes(layer);

function packetHeader(
    packetType: number,
    data: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0],
) {
    return [
        packetType,
        ...data,
        0xff - packetType - data.reduce((a, b) => a + b),
    ];
}

export function setLayerPayload(layer: Layer): Uint8Array<ArrayBuffer> {
    // prettier-ignore
    return new Uint8Array([
        ...packetHeader(0x04, [layer, 0, 0, 0, 0, 0]), 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
    ]);
}

// prettier-ignore
export const getLayerPayload = new Uint8Array([
    ...packetHeader(0x84), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

// prettier-ignore
export const getFirmwarePayload = new Uint8Array([
    ...packetHeader(0x8f), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

export function getActiveLayerKeysActuationChunkPayload(
    chunk: number,
    direction: "press" | "release",
): Uint8Array<ArrayBuffer> {
    const isUp = direction === "press" ? 0x00 : 0x01;
    // prettier-ignore
    return new Uint8Array([
        ...packetHeader(0xe5, [isUp, 1, chunk, 0, 0, 0]), 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
    ]);
}

export function getActiveLayerKeysRapidTriggerChunkPayload(
    chunk: number,
): Uint8Array<ArrayBuffer> {
    // prettier-ignore
    return new Uint8Array([
        ...packetHeader(0xe5, [0x07, 1, chunk, 0, 0, 0]), 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
    ]);
}

export function getActiveLayerKeysRapidTriggerSensitivityChunkPayload(
    chunk: number,
    direction: "press" | "release",
): Uint8Array<ArrayBuffer> {
    const isUp = direction === "press" ? 0x02 : 0x03;
    // prettier-ignore
    return new Uint8Array([
        ...packetHeader(0xe5, [isUp, 1, chunk, 0, 0, 0]), 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
    ]);
}

export function setKeyRapidTriggerChunkPayload(
    keys: Key[],
    chunk: number,
): Uint8Array<ArrayBuffer> {
    // prettier-ignore
    const keysRapidTrigger = keys.map((key) =>
        key.rapidTrigger ? 0x80 : 0,
    );
    assert(keysRapidTrigger.length <= 56, "a chunk can only have 56 keys");
    if (keysRapidTrigger.length < 56) {
        const oldLength = keysRapidTrigger.length;
        keysRapidTrigger.length = 56;
        keysRapidTrigger.fill(0, oldLength, -1);
    }
    console.log(keysRapidTrigger);
    // prettier-ignore
    return new Uint8Array([
        ...packetHeader(0x65, [0x07, 1, chunk, 0, 0, 0]),
        ...new Uint8Array(keysRapidTrigger)
    ]);
}

export function setKeyRapidTriggerSensitivityChunkPayload(
    chunk: number,
    keys: Key[],
    direction: "press" | "release",
): Uint8Array<ArrayBuffer> {
    const directionByte = direction === "press" ? 0x02 : 0x03;
    const keysSensitivity = keys.map((key) =>
        Math.floor(
            (direction === "press"
                ? key.rapidTriggerPressSensitivity
                : key.rapidTriggerReleaseSensitivity) * 100,
        ),
    );
    assert(keysSensitivity.length <= 28, "a chunk can only have 28 keys");
    if (keysSensitivity.length < 28) {
        const oldLength = keysSensitivity.length;
        keysSensitivity.length = 28;
        keysSensitivity.fill(0, oldLength, -1);
    }
    console.log(keysSensitivity);
    // prettier-ignore
    return new Uint8Array([
        ...packetHeader(0x65, [directionByte, 1, chunk, 0, 0, 0]),
        ...new Uint8Array(new Uint16Array(keysSensitivity).buffer),
    ]);
}

export function setKeyActuationChunkPayload(
    chunk: number,
    keys: Key[],
    direction: "press" | "release",
): Uint8Array<ArrayBuffer> {
    const directionByte = direction === "press" ? 0x00 : 0x01;
    const keysActuation = keys.map((key) =>
        Math.floor(
            (direction === "press" ? key.downActuation : key.upActuation) * 100,
        ),
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
        ...packetHeader(0x65, [directionByte, 1, chunk, 0, 0, 0]),
        ...new Uint8Array(new Uint16Array(keysActuation).buffer),
    ]);
}

export function setKeyActuationEndForDirectionPayload(
    direction: "press" | "release",
): Uint8Array<ArrayBuffer> {
    const isUp = direction === "press" ? 0x00 : 0x01;
    // prettier-ignore
    return new Uint8Array([
        ...packetHeader(0x65, [isUp, 0x01, 4, isUp, 0, 0]), 0x00, 0x00, 0x00, 0x00,
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
    rapidTrigger: boolean;
    rapidTriggerPressSensitivity: number;
    rapidTriggerReleaseSensitivity: number;
};

export async function getKeys(device: HIDDevice): Promise<Key[]> {
    console.debug("sending layer keys payload");

    const keys: Key[] = [];
    for (let key = 0; key < 128; key++) {
        keys[key] = {
            code: key,
            downActuation: 0,
            upActuation: 0,
            rapidTrigger: false,
            rapidTriggerPressSensitivity: 0.2,
            rapidTriggerReleaseSensitivity: 0.2,
        };
    }

    for (let chunk = 0; chunk < 2; chunk++) {
        await send(device, getActiveLayerKeysRapidTriggerChunkPayload(chunk));
        const payload = await receive(device);
        const chunkKeys = new Uint8Array(payload.buffer);
        for (let index = 0; index < chunkKeys.length; ++index) {
            const key = chunk * 64 + index;
            if (key >= keys.length) break;
            keys[key].rapidTrigger = chunkKeys[index] === 0x80;
        }
    }

    for (const direction of ["press", "release"] as const) {
        console.debug(direction);
        for (let chunk = 0; chunk < CHUNK_COUNT; chunk++) {
            console.debug("CHUNK", chunk);

            {
                await send(
                    device,
                    getActiveLayerKeysActuationChunkPayload(chunk, direction),
                );
                const payload = await receive(device);
                new Uint16Array(payload.buffer).forEach((actuation, index) => {
                    const key = keys[chunk * 32 + index];
                    if (direction === "press") {
                        key.downActuation = actuation / 100;
                    } else {
                        key.upActuation = actuation / 100;
                    }
                });
            }

            {
                await send(
                    device,
                    getActiveLayerKeysRapidTriggerSensitivityChunkPayload(
                        chunk,
                        direction,
                    ),
                );
                const payload = await receive(device);
                new Uint16Array(payload.buffer).forEach((actuation, index) => {
                    const key = keys[chunk * 32 + index];
                    if (direction === "press") {
                        key.rapidTriggerPressSensitivity = actuation / 100;
                    } else {
                        key.rapidTriggerReleaseSensitivity = actuation / 100;
                    }
                });
            }
        }
    }

    return keys;
}

export async function applyKeys(keyboard: Keyboard): Promise<void> {
    // TODO: Track changed keys and only update the modified chunks.

    for (let chunk = 0; chunk < 2; chunk++) {
        await send(
            keyboard.device,
            setKeyRapidTriggerChunkPayload(
                keyboard.keys.slice(chunk * 56, (chunk + 1) * 56),
                chunk,
            ),
        );
    }

    for (const direction of ["press", "release"] as const) {
        for (let chunk = 0; chunk < CHUNK_COUNT; chunk++) {
            await send(
                keyboard.device,
                setKeyActuationChunkPayload(
                    chunk,
                    keyboard.keys.slice(chunk * 28, (chunk + 1) * 28),
                    direction,
                ),
            );
            await send(
                keyboard.device,
                setKeyActuationEndForDirectionPayload(direction),
            );
            await send(
                keyboard.device,
                setKeyRapidTriggerSensitivityChunkPayload(
                    chunk,
                    keyboard.keys.slice(chunk * 28, (chunk + 1) * 28),
                    direction,
                ),
            );
        }
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
