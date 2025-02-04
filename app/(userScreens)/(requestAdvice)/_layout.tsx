import { Stack } from 'expo-router'
import React from 'react'

export default function _layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="viewNutritionists">
      <Stack.Screen name="viewNutritionists" />
    </Stack>
  )
}
