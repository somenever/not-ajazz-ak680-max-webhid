import { delay } from "$lib";
import type {
    Key,
    Keyboard,
    KeyboardConfig,
    KeyboardDriver,
    Layer,
} from "$lib/keyboard";
import { AK680_MAX_KEY_LIST } from "$lib/key-lists/ak680max";

const DUMMY_DRIVER: KeyboardDriver = {
    match: (device: HIDDevice) => false,
    getLayer: async (keyboard: Keyboard) => {
        return 0;
    },
    setLayer: async (keyboard: Keyboard, layer: Layer) => {
        await delay(100);
    },
    getKeys: async (keyboard: Keyboard) => {
        const keys: Key[] = [];

        for (const index in keyboard.config.keyList) {
            const code = Number(index);
            keys[code] = {
                code,
                downActuation: 1.2,
                upActuation: 0,
                rapidTrigger: false,
                rapidTriggerPressSensitivity: 0.1,
                rapidTriggerReleaseSensitivity: 0.1,
            };
        }

        return keys;
    },
    applyKeys: async (keyboard: Keyboard, keys: Key[]) => {
        await delay(100);
    },
};

/// A mock keyboard that doesn't interface with anything physical, useful for testing UI.
export const DUMMY_KEYBOARD: KeyboardConfig = {
    vendorId: 0x3151,
    productId: 0x502c,
    name: "Dummy Keyboard",
    minActuation: 0.1,
    maxActuation: 3.2,
    rtMinSensitivity: 0.01,
    rtMaxSensitivity: 2,
    features: ["calibration", "socd", "dks", "mt", "rs", "tgl"],
    pollingRates: [1000],
    keyList: AK680_MAX_KEY_LIST,
    driver: DUMMY_DRIVER,
};
