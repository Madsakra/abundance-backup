import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="graph">
      <Stack.Screen name="graph" />
    </Stack>
  );
}
