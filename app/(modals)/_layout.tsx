import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'transparentModal',      // <- overlays without pushing background
        animation: 'slide_from_bottom',
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        gestureEnabled: true,
      }}
    />
  );
}
