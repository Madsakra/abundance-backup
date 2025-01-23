import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="gateway">
      <Stack.Screen name="gateway" />
      {/* <Stack.Screen name="output/addActivity"/> */}
      {/* <Stack.Screen name="calories/caloriesInput"/>
      <Stack.Screen name="calories/caloriesGraph"/>
      <Stack.Screen name="calories/addMeals"/>
      <Stack.Screen name="calories/caloriesOutput"/>
  
      <Stack.Screen name="calories/netCalories"/> */}

      {/* <Stack.Screen name="glucose/glucoseLogging"/> */}
    </Stack>
  );
}
