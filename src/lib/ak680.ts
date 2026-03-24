import { joinByteArrays, withRetries } from "$lib";
import type {
    Key,
    Layer,
    KeyboardConfig,
    KeyboardDriver,
    Keyboard,
} from "./keyboard";
import { AK680_MAX_KEY_LIST } from "./key-lists/ak680max";

type DriverState = {
    // TODO: Some of these may be moved into Keyboard and shown in the UI.
    version: number;
    manufacturer: number;
    product: number;
    batteryLevel: number;
    chargeStatus: number;
    rtPrecision: number;
};

enum Command {
    GetDeviceInfo = 16,
}

/// A driver for RGB models of the AK680 MAX as well as the AK680 V2
const AK680_DRIVER: KeyboardDriver<DriverState> = {
    createDriverState: async (device: HIDDevice) => {
        const response = await sendCommand(
            device,
            Command.GetDeviceInfo,
            new Uint8Array(48),
        );
        const view = new DataView(response.buffer);

        return {
            // BCD number
            version:
                ((response[8] & 0x0f) +
                    ((response[8] & 0xf0) >> 4) * 10 +
                    response[9] * 100) /
                100,
            manufacturer: view.getUint16(12, true),
            product: view.getUint16(14, true),
            batteryLevel: response[17],
            chargeStatus: response[18],
            rtPrecision: response[29],
        };
    },
    getLayer: async (keyboard: Keyboard<DriverState>) => {
        throw new Error("Function not implemented.");
    },
    setLayer: async (keyboard: Keyboard<DriverState>, layer: Layer) => {
        throw new Error("Function not implemented.");
    },
    getKeys: async (keyboard: Keyboard<DriverState>) => {
        throw new Error("Function not implemented.");
    },
    applyKeys: async (keyboard: Keyboard<DriverState>, keys: Key[]) => {
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

type ResponsePacket = {
    header: number;
    command: number;
    lenOrType: number;
    addr: number;
    data: Uint8Array;
};

function parseResponsePacket(data: Uint8Array): ResponsePacket | null {
    if (data[0] !== 85) {
        console.error("Packet header missing magic byte");
        return null;
    }

    return {
        header: data[0],
        command: data[1],
        lenOrType: data[2],
        addr: data[3] | (data[4] << 8),
        data: data.slice(8),
    };
}

async function sendCommand(
    device: HIDDevice,
    commandType: number,
    data: Uint8Array,
    headerData: number[] = [],
): Promise<Uint8Array> {
    if (headerData.length > 3)
        throw new Error("Header data may not be larger than 3 bytes");

    const REPORT_SIZE = 32;
    const HEADER_SIZE = 8;
    const DATA_SIZE = REPORT_SIZE - HEADER_SIZE;

    const chunkCount = Math.ceil(data.byteLength / DATA_SIZE);

    const responsePackets: ResponsePacket[] = [];

    for (let chunk = 0; chunk < chunkCount; ++chunk) {
        const offset = chunk * DATA_SIZE;
        const bytesLeft = data.byteLength - chunk * DATA_SIZE;
        const chunkSize = chunk === chunkCount - 1 ? bytesLeft : DATA_SIZE;

        const report = new Uint8Array(REPORT_SIZE);
        const view = new DataView(report.buffer);
        report[0] = 170;
        report[1] = commandType;
        report[2] = chunkSize;
        view.setUint16(3, offset, true);
        report.set(headerData, 5);
        report.set(data.subarray(offset, offset + chunkSize), HEADER_SIZE);

        let inputReportHandler: (e: HIDInputReportEvent) => void;

        const responsePacket = await withRetries(
            async () =>
                new Promise<ResponsePacket>((resolve, reject) => {
                    inputReportHandler = (e: HIDInputReportEvent) => {
                        const packet = parseResponsePacket(
                            new Uint8Array(e.data.buffer),
                        );
                        if (packet && packet.command === commandType) {
                            resolve(packet);
                        }
                    };
                    device.addEventListener("inputreport", inputReportHandler);
                    device.sendReport(0, report).catch((err) => {
                        reject(err);
                    });
                }),
            {
                cleanup: () =>
                    device.removeEventListener(
                        "inputreport",
                        inputReportHandler,
                    ),
            },
        );
        responsePackets.push(responsePacket);
    }
    if (responsePackets.length === 0)
        throw new Error("Did not receive any command response packets");

    return joinByteArrays(responsePackets.map((packet) => packet.data));
}
