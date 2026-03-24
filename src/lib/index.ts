export const nullOf = <T>(): T | null => null;

export function assert(
    condition: boolean,
    message?: string,
): asserts condition {
    if (!condition) {
        throw new Error("Assertion failed" + (message ? `: ${message}` : "!"));
    }
}

export const delay = async (ms: number) =>
    new Promise((resolve, _) => setTimeout(resolve, ms));

export async function withTimeout<T>(promise: Promise<T>, ms: number) {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms),
        ),
    ]);
}

export async function withRetries<T>(
    task: () => Promise<T>,
    {
        retries = 3,
        timeout = 500,
        cleanup = () => {},
    }: { retries?: number; timeout?: number; cleanup?: () => void } = {},
): Promise<T> {
    for (let i = 0; i <= retries; i++) {
        try {
            return await withTimeout(task(), timeout);
        } catch (err) {
            if (i === retries) throw err;
        } finally {
            cleanup();
        }
    }
    throw new Error("unreachable");
}

export function joinByteArrays(arrays: Uint8Array[]): Uint8Array {
    const result = new Uint8Array(
        arrays.reduce((sum, a) => sum + a.byteLength, 0),
    );
    let offset = 0;
    for (const a of arrays) {
        result.set(a, offset);
        offset += a.byteLength;
    }
    return result;
}
