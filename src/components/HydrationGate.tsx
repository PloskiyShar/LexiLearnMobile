// src/components/HydrationGate.tsx
import React from "react";
import {ActivityIndicator, View, ViewStyle} from "react-native";
import { useBooks } from "../store/books";

export default function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useBooks((s) => s._hasHydrated);
  if (!hydrated) {
    return (
      <View style={[{ flex: 1, alignItems: "center", justifyContent: "center" } as ViewStyle]}>
        <ActivityIndicator />
      </View>
    );
  }
  return <>{children}</>;
}
