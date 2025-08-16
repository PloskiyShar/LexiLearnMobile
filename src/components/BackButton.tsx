// src/components/BackButton.tsx
import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import { router } from 'expo-router';
import {useIOSColors} from "src/theme/useIOSColor";

export default function BackButton() {
  const c = useIOSColors()

  return (
    <TouchableOpacity
      accessibilityIgnoresInvertColors={true}
      onPress={() => router.back()}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <View style={{display: 'flex', flexDirection: 'row'}}>
        {/* simple chevron + label; swap for an icon if you like */}
        <Text style={{color: c.tint, fontSize: 30, lineHeight: 30}}>{'‹'}</Text>
        <Text style={{color: c.tint, fontSize: 18, lineHeight: 28}}>{' Back'}</Text>
      </View>
    </TouchableOpacity>
  );
}

