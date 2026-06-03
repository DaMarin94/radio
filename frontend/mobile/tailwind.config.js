/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind needs to scan the entry and every source file for className usage.
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
