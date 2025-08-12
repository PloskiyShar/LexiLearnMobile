import React from "react";
import { Tabs } from "expo-router";
import { useTheme } from "@/src/theme/theme";
import CustomTabBar from "@/components/CustomTabBar";

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Let screens paint their own bg
        sceneContainerStyle: { backgroundColor: t.colors.background },
      }}
    >
      <Tabs.Screen name="index" />
       <Tabs.Screen name="exchange" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
