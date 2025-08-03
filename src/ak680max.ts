import { assert } from "$/util";

export const FILTER_AK680_MAX = { vendorId: 0x3151, productId: 0x502c };
export const LAYERS = [1, 2, 3, 4] as const;

export type Keyboard = {
    activeLayer: Layer;
    device: HIDDevice;
};
export type Layer = (typeof LAYERS)[number];

const isLayer = (layer: any): layer is Layer => LAYERS.includes(layer);

export function setLayerPayload(layer: Layer): Uint8Array<ArrayBuffer> {
    const layerByte1 = {
        1: 0x00,
        2: 0x01,
        3: 0x02,
        4: 0x03,
    }[layer];
    const layerByte2 = {
        1: 0xfb,
        2: 0xfa,
        3: 0xf9,
        4: 0xf8,
    }[layer];
    // prettier-ignore
    return new Uint8Array([
        0x04, layerByte1, 0x00, 0x00, 0x00, 0x00, 0x00, layerByte2, 0x00, 0x00, 0x00, 0x00,
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
    const layer = payload.getUint8(2) + 1;
    assert(isLayer(layer), `expected layer 1-4, got ${layer}`);
    return layer;
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
    const [device] = devices.filter(isAk680MaxVendorControl);
    console.debug("found the right device!", device);
    await device.open();
    console.debug("opened the device!");

    return {
        activeLayer: await getActiveLayer(device),
        device,
    };
}
