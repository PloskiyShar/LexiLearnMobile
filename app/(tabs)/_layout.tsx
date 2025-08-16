import React from "react";
import { Tabs } from "expo-router";
import CustomTabBar from "@/components/CustomTabBar";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useIOSColors} from "src/theme/useIOSColor";
const isOutlined = (name: string, isFocused: boolean, customName: string = '') => {
  return `${customName || name}${!isFocused ? "-outline" : ""}`
}

const iconFor = (name: string, isFocused: boolean) => {
  switch (name) {
    case "index":
      return isOutlined(name, isFocused, "home");
    case "stats":
      return isOutlined(name, isFocused);
    case "books":
      return isOutlined(name, isFocused, "book");
    case "settings":
      return isOutlined(name, isFocused);
    default:
      return isOutlined(name, isFocused);
  }
};
export default function TabsLayout() {
  const c = useIOSColors()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
        tabBarIcon: ({color, focused}) => <Ionicons
          name={iconFor("index", focused)}
          size={28}
          color={color}
        />,
          headerShown: false,
          headerTitle: ''
      }} />
      <Tabs.Screen
        name="books"
        options={{
          tabBarIcon: ({color, focused}) => <Ionicons
            name={iconFor("books", focused)}
            size={28}
            color={color}
          />,
        }}
      />
       {/*<Tabs.Screen*/}
       {/*  name="exchange"*/}
       {/*/>*/}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({color, focused}) => <Ionicons
            name={iconFor("settings", focused)}
            size={28}
            color={color}
          />,
        }}
      />
    </Tabs>
  );
}
