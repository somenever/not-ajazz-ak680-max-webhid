import { delay } from "$lib";
import { AK680_MAX_LIGHTLESS } from "./ak680max-lightless";
import {
    AK680_MAX,
    AK680_V2_32956,
    AK680_V2_32961,
    AK680_V2_32962,
} from "./ak680";

export const LAYERS = [0, 1, 2, 3] as const;

export type Layer = (typeof LAYERS)[number];

export const isLayer = (layer: any): layer is Layer => LAYERS.includes(layer);

export type KeyboardFeature =
    | "rgb"
    | "socd"
    | "dks"
    | "mt"
    | "tgl"
    | "rs"
    | "calibration"
    | "layers";

export type KeyboardConfig<T = unknown> = {
    vendorId: number;
    productId: number;
    usagePage: number;

    name: string;

    minActuation: number;
    maxActuation: number;

    rtMinSensitivity: number;
    rtMaxSensitivity: number;

    features: KeyboardFeature[];
    pollingRates: number[];

    keyList: readonly string[];

    driver: KeyboardDriver<T>;
};

export interface KeyboardDriver<T = unknown> {
    createDriverState?: (device: HIDDevice) => Promise<T>;

    getLayer(keyboard: Keyboard<T>): Promise<Layer>;
    setLayer(keyboard: Keyboard<T>, layer: Layer): Promise<void>;

    getKeys(keyboard: Keyboard<T>): Promise<Key[]>;
    applyKeys(keyboard: Keyboard<T>, keys: Key[]): Promise<void>;
}

export type Keyboard<T = unknown> = {
    config: KeyboardConfig<T>;
    driverState: T;
    rtPrecision: number;
    activeLayer: Layer;
    device: HIDDevice;
    keys: Key[];
    busy: boolean;
};

export type Key = {
    code: number;
    downActuation: number;
    upActuation: number;
    rapidTrigger: boolean;
    rapidTriggerPressSensitivity: number;
    rapidTriggerReleaseSensitivity: number;
};

export const KEYBOARDS = [
    AK680_MAX_LIGHTLESS,
    AK680_MAX,
    AK680_V2_32956,
    AK680_V2_32961,
    AK680_V2_32962,
];

export const findKeyboardConfigForDevice = (device: HIDDevice) =>
    KEYBOARDS.find(
        (k) =>
            k.vendorId === device.vendorId &&
            k.productId === device.productId &&
            device.collections.some(
                (collection) => k.usagePage === collection.usagePage,
            ),
    );

export async function connectKeyboard(): Promise<Keyboard> {
    const filters = KEYBOARDS.map((k) => ({
        vendorId: k.vendorId,
        productId: k.productId,
    }));

    const devices = await navigator.hid.requestDevice({ filters });

    for (const device of devices) {
        const config = findKeyboardConfigForDevice(device);
        if (!config) continue;

        try {
            await device.open();

            const keyboard: Keyboard = {
                device,
                config,
                driverState:
                    (await config.driver.createDriverState?.(device)) ?? null,
                activeLayer: 0,
                rtPrecision: 100,
                keys: [],
                busy: false,
            };
            keyboard.activeLayer = await config.driver.getLayer(keyboard);
            keyboard.keys = await config.driver.getKeys(keyboard);
            return keyboard;
        } catch (err) {
            const causeMessage = err instanceof Error ? ": " + err.message : "";
            throw new Error("Failed to initialize keyboard" + causeMessage, {
                cause: err,
            });
        }
    }

    throw new Error("Unsupported keyboard");
}

async function lockKeyboard<T>(
    keyboard: Keyboard,
    task: () => Promise<T>,
): Promise<T> {
    try {
        keyboard.busy = true;
        return await task();
    } finally {
        keyboard.busy = false;
    }
}

export const setLayer = async (keyboard: Keyboard, layer: Layer) =>
    lockKeyboard(keyboard, async () => {
        await keyboard.config.driver.setLayer(keyboard, layer);
        keyboard.activeLayer = layer;

        await delay(250);
        keyboard.keys = await keyboard.config.driver.getKeys(keyboard);
    });

export const applyKeys = async (keyboard: Keyboard, keys: Key[]) =>
    lockKeyboard(keyboard, () =>
        keyboard.config.driver.applyKeys(keyboard, keys),
    );
