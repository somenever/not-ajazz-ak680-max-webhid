# Not A WebHID Utility For The AJAZZ AK680 MAX Keyboard

## Disclaimer
This project is presented as a work of fiction, solely for the purpose of entertainment. Neither Ajazz Electronic Technology Co., Ltd.. nor any of its associates, subsidiaries, distributors, sellers, etc. have any knowledge of it, nor have given any approval of the software it contains. Any use of the software included here will void any and all warranties provided by Ajazz and/or other entities, and may permanently damage the hardware it affects. Potential users of the software assume all risk and responsibility and agree to hold harmless Ajazz, GitHub, the author, and any and all other entities.

## Supported Features
- Layer switching
- Viewing and changing actuation points
- Rapid Trigger settings

## Tested Models
- AK680 MAX Black No RGB (Firmware: ID2317_V303)
- YMMV for other models, but feel free to (not) try it out! Also, if you're just looking for a way to configure your keyboard on Linux - the Chinese company that makes the official software has WebHID support for *some* models - but not mine (which is why I made this utility in the first place). You can find it [here](https://qmk.top), just make sure that you spoof your user agent to a Windows or Mac one and don't use the IOT driver. As long as you have the appropriate udev rules set up and your device is supported, the website might just work on Linux.

## Developing
The web UI is built with Bun and SvelteKit. Simply install the dependencies and run `bun dev` to start the development server.

## Acknowledgements
- [NotLinuxAjazzAK33RGB](https://github.com/thanks4opensource/NotLinuxAjazzAK33RGB) for the disclaimer text and inspiration with the sneaky naming
