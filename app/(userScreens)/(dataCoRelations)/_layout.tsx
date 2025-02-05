import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="relation-graph">
      <Stack.Screen name="relation-graph" />
    </Stack>
  );
}
