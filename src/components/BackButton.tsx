// src/components/BackButton.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Box, Text, useTheme } from '../theme/theme';

export default function BackButton() {
  const theme = useTheme();

  return (
    <TouchableOpacity
      accessibilityIgnoresInvertColors={true}
      onPress={() => router.back()}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Box bg="background" flexDirection="row" alignItems="center" paddingHorizontal="sm" paddingVertical="xs">
        {/* simple chevron + label; swap for an icon if you like */}
        <Text color={theme.colors.text} fontSize={16} lineHeight={24}>{'‹'}</Text>
        <Box width={6} />
        <Text color={theme.colors.text} fontSize={16} lineHeight={24}>Back</Text>
      </Box>
    </TouchableOpacity>
  );
}
