import { defineConfig } from "@rsbuild/core";
import { pluginPreact } from "@rsbuild/plugin-preact";

export default defineConfig({
    plugins: [pluginPreact()],
    resolve: {
        alias: {
            $: "./src/",
        },
    },
    html: { title: "Not AJAZZ AK680 MAX Web Utility" },
});
