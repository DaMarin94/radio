import "./global.css";

import { SafeAreaView, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

// Import from @radio/shared to PROVE the Metro/TS wiring works end-to-end.
// `resolveStationByTuning` is a pure function and `RadioStation` is a type,
// both transpiled from raw TS in frontend/shared/src.
import { resolveStationByTuning, type RadioStation } from "@radio/shared";

import { TunerDial } from "./src/components/TunerDial";

const DEMO_VALUE = 100.7;

// Trivial smoke-test of the shared logic at module load.
const DEMO_STATIONS: RadioStation[] = [
  {
    id: "demo",
    name: "Demo FM",
    displayName: "Demo FM",
    streamUrl: "",
    tags: [],
    frequency: "100.7",
    band: "FM",
  },
];
const resolved = resolveStationByTuning(DEMO_VALUE, DEMO_STATIONS);

export default function App() {
  const stationName = resolved?.displayName ?? "—";

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-neutral-500 text-xs uppercase tracking-[4px] mb-2">
          Radio
        </Text>

        <Text className="text-amber-400 text-6xl font-bold tabular-nums">
          {DEMO_VALUE.toFixed(1)}
        </Text>
        <Text className="text-neutral-400 text-sm mt-1">FM</Text>

        <TunerDial value={DEMO_VALUE} />

        <Text className="text-neutral-500 text-xs mt-4">
          shared wiring OK · resolved: {stationName}
        </Text>
        <Text className="text-neutral-700 text-[10px] mt-6">
          scaffold · not the v1 tuner yet
        </Text>
      </View>
    </SafeAreaView>
  );
}
