import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="goals">
      <Stack.Screen name="goals" />
    </Stack>
  );
}
