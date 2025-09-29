import { get, writable } from "svelte/store";

export function storable<T>(name: string, data: T) {
    const store = writable(data);
    const { subscribe, set } = store;
    const isBrowser = typeof window !== "undefined";

    isBrowser && localStorage[name] && set(JSON.parse(localStorage[name]));

    return {
        subscribe,
        set: (value: T) => {
            isBrowser && (localStorage[name] = JSON.stringify(value));
            set(value);
        },
        update: (cb: (value: T) => T) => {
            const updatedStore = cb(get(store));

            isBrowser && (localStorage[name] = JSON.stringify(updatedStore));
            set(updatedStore);
        },
    };
}

export type Storable<T> = ReturnType<typeof storable<T>>;
