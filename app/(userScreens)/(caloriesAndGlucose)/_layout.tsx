import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="gateway">
      <Stack.Screen name="gateway" />

    </Stack>
  );
}
