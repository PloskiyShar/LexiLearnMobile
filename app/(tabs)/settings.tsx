import * as React from 'react'
import {
  View,
  Text,
  Switch,
  useColorScheme, StyleSheet,
} from 'react-native'
import { Stack } from 'expo-router'
import { useThemePref } from '../../src/store/theme'
import {useIOSColors} from "src/theme/useIOSColor";


function Cell({
                children,
                last,
              }: {
  children: React.ReactNode
  last?: boolean
}) {
  const c = useIOSColors()
  return (
    <View
      style={{
        backgroundColor: c.groupBg,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
      }}>
      {children}
    </View>
  )
}

export default function SettingsScreen() {
  const c = useIOSColors()
  const { effective, toggleNight } = useThemePref()
  const nightOn = effective === 'dark'
  console.log(c.label, 'label')
  console.log(c.groupBg, 'groupBg')
  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={{ flex: 1, padding: 16 }}>

          <Cell>
            <View
              style={[styles.container, {backgroundColor: c.groupBg}]}
            >
              <Text
                style={{ color: c.label }}
              >Night Mode</Text>
              <Switch value={nightOn} onValueChange={toggleNight} />
            </View>
          </Cell>
        {/*</View>*/}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});