import { View, Text } from "react-native";

type TunerDialProps = {
  /** Current dial value (frequency-ish). Display only for now. */
  value?: number;
};

/**
 * STUB. Visual placeholder for the physical-style tuner dial.
 * TODO(mobile-v1): port the real dial + pan-gesture / scroll interaction
 * (see frontend/web TunerDial for reference behavior).
 */
export function TunerDial({ value = 100.7 }: TunerDialProps) {
  return (
    <View className="w-full items-center py-8">
      <View className="h-24 w-11/12 rounded-xl border border-neutral-700 bg-neutral-900 items-center justify-center">
        <Text className="text-neutral-500 text-xs uppercase tracking-widest">
          dial (stub)
        </Text>
        <Text className="text-neutral-300 text-base mt-1">{value.toFixed(1)}</Text>
      </View>
    </View>
  );
}

export default TunerDial;
