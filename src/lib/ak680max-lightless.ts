import { assert } from "$lib";
import {
    isLayer,
    type Key,
    type KeyboardConfig,
    type Layer,
} from "$lib/keyboard";
import { AK680_MAX_LIGHTLESS_KEY_LIST } from "./key-lists/ak680max-lightless";

const REPORT_SIZE = 64;
const CHUNK_COUNT = 4;

export const AK680_MAX_LIGHTLESS: KeyboardConfig = {
    vendorId: 0x3151,
    productId: 0x502c,
    usagePage: 0xffff,
    name: "AK680 MAX",
    minActuation: 0.1,
    maxActuation: 3.2,
    rtMinSensitivity: 0.01,
    rtMaxSensitivity: 2,
    features: ["calibration", "socd", "dks", "mt", "rs", "tgl"],
    pollingRates: [1000],
    keyList: AK680_MAX_LIGHTLESS_KEY_LIST,
    driver: {
        getLayer: async (device: HIDDevice) => getActiveLayer(device),
        setLayer: async (device: HIDDevice, layer: Layer) =>
            send(device, setLayerPayload(layer)),
        getFirmwareID: async (device: HIDDevice) => getFirmwareID(device),
        getKeys: async (device: HIDDevice, config: KeyboardConfig) =>
            getKeys(device, config),
        // TODO: This should take a diff of keys or something
        applyKeys: async (device: HIDDevice, keys: Key[]) => {
            for (let chunk = 0; chunk < 2; chunk++) {
                await send(
                    device,
                    setKeyRapidTriggerChunkPayload(
                        keys.slice(chunk * 56, (chunk + 1) * 56),
                        chunk,
                    ),
                );
            }

            for (const direction of ["press", "release"] as const) {
                for (let chunk = 0; chunk < CHUNK_COUNT; chunk++) {
                    await send(
                        device,
                        setKeyActuationChunkPayload(
                            chunk,
                            keys.slice(chunk * 28, (chunk + 1) * 28),
                            direction,
                        ),
                    );
                    await send(
                        device,
                        setKeyActuationEndForDirectionPayload(direction),
                    );
                    await send(
                        device,
                        setKeyRapidTriggerSensitivityChunkPayload(
                            chunk,
                            keys.slice(chunk * 28, (chunk + 1) * 28),
                            direction,
                        ),
                    );
                }
            }
        },
    },
};

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

function buildPacket(
    header: ArrayLike<number>,
    body: ArrayLike<number> = [],
): Uint8Array<ArrayBuffer> {
    const buf = new Uint8Array(REPORT_SIZE);
    buf.set(header, 0);
    buf.set(body, header.length);
    return buf;
}

const getLayerPayload = buildPacket(packetHeader(0x84));
const setLayerPayload = (layer: Layer) =>
    buildPacket(packetHeader(0x04, [layer, 0, 0, 0, 0, 0]));

const getFirmwarePayload = buildPacket(packetHeader(0x8f));

function getActiveLayerKeysActuationChunkPayload(
    chunk: number,
    direction: "press" | "release",
) {
    const isUp = direction === "press" ? 0x00 : 0x01;
    return buildPacket(packetHeader(0xe5, [isUp, 1, chunk, 0, 0, 0]));
}

const getActiveLayerKeysRapidTriggerChunkPayload = (chunk: number) =>
    buildPacket(packetHeader(0xe5, [0x07, 1, chunk, 0, 0, 0]));

function getActiveLayerKeysRapidTriggerSensitivityChunkPayload(
    chunk: number,
    direction: "press" | "release",
) {
    const isUp = direction === "press" ? 0x02 : 0x03;
    return buildPacket(packetHeader(0xe5, [isUp, 1, chunk, 0, 0, 0]));
}

function setKeyRapidTriggerChunkPayload(
    keys: Key[],
    chunk: number,
): Uint8Array<ArrayBuffer> {
    const keysRapidTrigger = Array.from(keys, (key) =>
        key?.rapidTrigger ? 0x80 : 0,
    );
    assert(keysRapidTrigger.length <= 56, "a chunk can only have 56 keys");
    return buildPacket(
        packetHeader(0x65, [0x07, 1, chunk, 0, 0, 0]),
        keysRapidTrigger,
    );
}

function setKeyRapidTriggerSensitivityChunkPayload(
    chunk: number,
    keys: Key[],
    direction: "press" | "release",
): Uint8Array<ArrayBuffer> {
    const directionByte = direction === "press" ? 0x02 : 0x03;
    const keysSensitivity = Array.from(keys, (key) =>
        key
            ? Math.round(
                  (direction === "press"
                      ? key.rapidTriggerPressSensitivity
                      : key.rapidTriggerReleaseSensitivity) * 100,
              )
            : 0,
    );
    assert(keysSensitivity.length <= 28, "a chunk can only have 28 keys");
    return buildPacket(
        packetHeader(0x65, [directionByte, 1, chunk, 0, 0, 0]),
        new Uint8Array(new Uint16Array(keysSensitivity).buffer),
    );
}

function setKeyActuationChunkPayload(
    chunk: number,
    keys: Key[],
    direction: "press" | "release",
): Uint8Array<ArrayBuffer> {
    const directionByte = direction === "press" ? 0x00 : 0x01;
    const keysActuation = Array.from(keys, (key) =>
        key
            ? Math.round(
                  (direction === "press"
                      ? key.downActuation
                      : key.upActuation) * 100,
              )
            : 0,
    );
    assert(keysActuation.length <= 28, "a chunk can only have 28 keys");
    return buildPacket(
        packetHeader(0x65, [directionByte, 1, chunk, 0, 0, 0]),
        new Uint8Array(new Uint16Array(keysActuation).buffer),
    );
}

function setKeyActuationEndForDirectionPayload(
    direction: "press" | "release",
): Uint8Array<ArrayBuffer> {
    const isUp = direction === "press" ? 0x00 : 0x01;
    return buildPacket(packetHeader(0x65, [isUp, 0x01, 4, isUp, 0, 0]));
}

async function send(
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

async function getKeys(
    device: HIDDevice,
    config: KeyboardConfig,
): Promise<Key[]> {
    console.debug("sending layer keys payload");

    const keys: Key[] = [];

    for (const index in config.keyList) {
        const code = Number(index);
        keys[code] = {
            code,
            upActuation: 0,
            downActuation: 0,
            rapidTrigger: false,
            rapidTriggerPressSensitivity: 0,
            rapidTriggerReleaseSensitivity: 0,
        };
    }

    for (let chunk = 0; chunk < 2; chunk++) {
        await send(device, getActiveLayerKeysRapidTriggerChunkPayload(chunk));
        const payload = await receive(device);
        const chunkKeys = new Uint8Array(payload.buffer);
        for (let index = 0; index < chunkKeys.length; ++index) {
            const key = keys[chunk * 64 + index];
            if (!key) break;

            key.rapidTrigger = chunkKeys[index] === 0x80;
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
                    if (!key) return;

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
                    if (!key) return;

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
