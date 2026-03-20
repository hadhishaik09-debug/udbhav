import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="ai-assistant" />
      <Stack.Screen name="medicine-search" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="order-confirmation" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="sos" />
    </Stack>
  );
}
