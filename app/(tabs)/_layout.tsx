import Ionicons from "@expo/vector-icons/Ionicons";
import * as React from "react";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const scheme = 'dark';
  const isDark = scheme !== "light";
  const BG = isDark ? "#0B0B0B" : "#FFFFFF";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneContainerStyle: { backgroundColor: BG },
        tabBarStyle: { backgroundColor: BG, borderTopColor: border },
        tabBarActiveTintColor: isDark ? "#A8E6DF" : "#0F766E",
        tabBarInactiveTintColor: "#8A8A8A",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home",     tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
      }} />
      <Tabs.Screen name="two" options={{ title: "Tab Two",         tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} />,
      }} />
    </Tabs>
  );
}
