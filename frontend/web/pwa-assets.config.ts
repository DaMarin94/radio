import {
  defineConfig,
  minimalPreset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  preset: {
    ...minimalPreset,
    appleTouchIcon: {
      sizes: [180],
      padding: 0,
      resizeOptions: { background: "#040805" },
    },
  },
  images: ["public/favicon.svg"],
});
