import type { Key, Layer, KeyboardConfig, KeyboardDriver } from "./keyboard";
import { AK680_MAX_KEY_LIST } from "./key-lists/ak680max";

/// A driver for RGB models of the AK680 MAX as well as the AK680 V2
const AK680_DRIVER: KeyboardDriver = {
    getLayer: async (device: HIDDevice) => {
        throw new Error("Function not implemented.");
    },
    setLayer: async (device: HIDDevice, layer: Layer) => {
        throw new Error("Function not implemented.");
    },
    getFirmwareID: async (device: HIDDevice) => {
        throw new Error("Function not implemented.");
    },
    getKeys: async (device: HIDDevice) => {
        throw new Error("Function not implemented.");
    },
    applyKeys: async (device: HIDDevice, keys: Key[]) => {
        throw new Error("Function not implemented.");
    },
};

const createAK680Config = (
    options: Partial<KeyboardConfig> & { productId: number },
): KeyboardConfig => ({
    driver: AK680_DRIVER,
    vendorId: 3141,
    usagePage: 65383,
    name: "AK680 MAX",
    defaultActuation: 1.2,
    maxActuation: 3.4,
    minActuation: 0.1,
    rtMinSensitivity: 0.01,
    rtMaxSensitivity: 2,
    features: ["calibration", "rgb", "rs", "socd", "dks", "mt", "tgl"],
    pollingRates: [1000, 4000, 8000],
    keyList: AK680_MAX_KEY_LIST,
    ...options,
});

const createAK680V2Config = (productId: number) =>
    createAK680Config({ productId, name: "AK680 V2", maxActuation: 3.3 });

export const AK680_MAX = createAK680Config({ productId: 32946 });

export const AK680_V2_32956 = createAK680V2Config(32956);
export const AK680_V2_32961 = createAK680V2Config(32961);
export const AK680_V2_32962 = createAK680V2Config(32962);
