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
    | "calibration";

export type KeyboardConfig = {
    vendorId: number;
    productId: number;
    usagePage: number;

    name: string;

    defaultActuation: number;
    minActuation: number;
    maxActuation: number;

    rtMinSensitivity: number;
    rtMaxSensitivity: number;

    features: KeyboardFeature[];
    pollingRates: number[];

    keyList: readonly string[];

    driver: KeyboardDriver;
};

export interface KeyboardDriver {
    getLayer(device: HIDDevice): Promise<Layer>;
    setLayer(device: HIDDevice, layer: Layer): Promise<void>;

    getFirmwareID(device: HIDDevice): Promise<number>;

    getKeys(device: HIDDevice): Promise<Key[]>;
    applyKeys(device: HIDDevice, keys: Key[]): Promise<void>;
}

export type Keyboard = {
    config: KeyboardConfig;
    firmwareID: number;
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

export const KEYBOARDS: KeyboardConfig[] = [
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

        await device.open();
        return {
            activeLayer: await config.driver.getLayer(device),
            firmwareID: await config.driver.getFirmwareID(device),
            keys: await config.driver.getKeys(device),
            busy: false,
            device,
            config,
        };
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
    lockKeyboard(keyboard, () =>
        keyboard.config.driver.setLayer(keyboard.device, layer),
    );

export const applyKeys = async (keyboard: Keyboard, keys: Key[]) =>
    lockKeyboard(keyboard, () =>
        keyboard.config.driver.applyKeys(keyboard.device, keys),
    );
