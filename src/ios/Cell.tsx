// src/ios/Cell.tsx
import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import {useIOSColors} from "src/theme/useIOSColor";

type Props = {
  title: string;
  subtitle?: string;
  trailingText?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  accessory?: 'disclosure' | 'none';
};

export default function Cell({
                               title,
                               subtitle,
                               trailingText,
                               onPress,
                               onLongPress,
                               accessory = 'disclosure',
                             }: Props) {
  const c = useIOSColors()
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.secondaryGroupedBackground, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.textWrap}>
        <Text style={[styles.title, {color: c.label as any,}]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, {color: c.secondaryLabel as any,}]}>{subtitle}</Text> : null}
      </View>

      {trailingText ? <Text style={[styles.trailing, {color: c.secondaryLabel as any,}]}>{trailingText}</Text> : null}

      {accessory === 'disclosure' ? <Text style={[styles.chevron, {color: c.tertiaryLabel as any,}]}>›</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textWrap: { flex: 1, paddingRight: 8 },
  title: { fontSize: 17, fontWeight: '600' },
  subtitle: {  fontSize: 13, marginTop: 2 },
  trailing: {  fontSize: 15, marginRight: 6 },
  chevron: {  fontSize: 22, marginLeft: 2 },
});
