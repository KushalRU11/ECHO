import { useEffect } from 'react';
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useUserSync } from '../hooks/useUserSync';
import { useNotifications } from '../hooks/useNotifications';

const queryClient = new QueryClient();

function AppContent() {
  const { isSynced } = useUserSync();
  const { expoPushToken } = useNotifications();

  useEffect(() => {
    if (expoPushToken) {
      console.log('Push token:', expoPushToken);
    }
  }, [expoPushToken]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider tokenCache={tokenCache}>
        <AppContent />
      </ClerkProvider>
    </QueryClientProvider>
  );
}