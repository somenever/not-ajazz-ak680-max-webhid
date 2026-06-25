# Not A WebHID Utility For The AJAZZ AK680 MAX Keyboard

## Disclaimer
This project is presented as a work of fiction, solely for the purpose of entertainment. Neither Ajazz Electronic Technology Co., Ltd.. nor any of its associates, subsidiaries, distributors, sellers, etc. have any knowledge of it, nor have given any approval of the software it contains. Any use of the software included here will void any and all warranties provided by Ajazz and/or other entities, and may permanently damage the hardware it affects. Potential users of the software assume all risk and responsibility and agree to hold harmless Ajazz, GitHub, the author, and any and all other entities.

## Supported Features
- Layer switching
- Viewing and changing actuation points
- Rapid Trigger settings

## Supported Models
- AK680 MAX Black No RGB (Firmware: ID2317_V303)
- WIP: AK680V2, AK680 MAX RGB (Tracking Issue: #1)
- YMMV for other models, but feel free to (not) try it out! Also, if you're just looking for a way to configure your keyboard on Linux - AJAZZ's official website has WebHID support for *some* models - but not mine (which is why I made this utility in the first place). You can find their software [here](https://ajazz.driveall.cn). As long as you have the appropriate udev rules set up and your device is supported, the website might just work on Linux. Note that this doesn't mean that other models will not be supported in the future by this tool. Feel free to submit an [issue](https://github.com/somenever/not-ajazz-ak680-max-webhid/issues/new) if you want your model supported.

## Developing
The web UI is built with Bun and SvelteKit. Simply install the dependencies and run `bun dev` to start the development server.

## Acknowledgements
- [NotLinuxAjazzAK33RGB](https://github.com/thanks4opensource/NotLinuxAjazzAK33RGB) for the disclaimer text and inspiration with the sneaky naming
