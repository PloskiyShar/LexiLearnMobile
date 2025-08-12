// src/components/FullScreenLoader.tsx
import React from "react";
import {ActivityIndicator, View, ViewStyle} from "react-native";

export default function FullScreenLoader({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View
      pointerEvents="auto"
      style={[{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      } as ViewStyle]}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}
