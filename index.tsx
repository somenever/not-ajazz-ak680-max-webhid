import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import styled from "styled-components";

import { nullOf } from "$/util";
import {
    connectKeyboard,
    isAk680MaxVendorControl,
    KEYMAP,
    LAYERS,
    send,
    setLayerPayload,
    type Keyboard,
} from "$/ak680max";

function App() {
    const [keyboard, setKeyboard] = useState(nullOf<Keyboard>());

    useEffect(() => {
        navigator.hid.addEventListener("disconnect", (event) => {
            if (isAk680MaxVendorControl(event.device)) {
                setKeyboard(null);
            }
        });
    }, []);

    if (!keyboard) {
        return (
            <div>
                <h1>Welcome to the Not AJAZZ AK680 MAX Web Utility</h1>
                <p>Connect your not-a-keyboard by pressing the button below</p>
                <button onClick={() => connectKeyboard().then(setKeyboard)}>
                    Connect
                </button>
            </div>
        );
    }

    return (
        <div>
            <h2>AJAZZ AK680 MAX</h2>
            <p>Connected</p>
            <p>Firmware: ID{keyboard.firmwareID}</p>

            <h2>Layers</h2>
            <p>Current: Layer {keyboard.activeLayer + 1}</p>
            {LAYERS.map((layer) => (
                <button
                    onClick={() => {
                        send(keyboard.device, setLayerPayload(layer));
                        setKeyboard({ ...keyboard, activeLayer: layer });
                    }}
                >
                    Layer {layer + 1}
                </button>
            ))}

            <h2>Keys</h2>
            <Keys>
                {keyboard.keys.map(
                    (key) =>
                        KEYMAP[key.code] && (
                            <Key>
                                <h2>{KEYMAP[key.code]}</h2>
                                <KeyActuationUp>
                                    {key.upActuation}
                                </KeyActuationUp>
                                <KeyActuationDown>
                                    {key.downActuation}
                                </KeyActuationDown>
                            </Key>
                        ),
                )}
            </Keys>
        </div>
    );
}

render(<App />, document.body);
