import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ServerErrorScreen } from '@/components/error/server-error-screen';
import { FontAssets } from '@/constants/fonts';
import { AppProviders } from '@/providers/app-providers';

SplashScreen.preventAutoHideAsync();

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <ServerErrorScreen onRetry={retry} />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FontAssets);

  useEffect(() => {
    if (fontError) {
      console.error('Failed to load fonts:', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="select-city" />
        <Stack.Screen name="search" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="srp" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="hdp" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="booking" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="booking-success"
          options={{ animation: 'slide_from_right', gestureEnabled: false }}
        />
        <Stack.Screen name="move-in-steps" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="move-in-background" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="move-in-about-you" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="move-in-checklist" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="move-in-document-verification"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen name="move-in-payment" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="move-out-checklist" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="menu" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="roommates" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="visitors" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="my-visits" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="my-wishlist" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="sos" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="complete-payment" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="invoice" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ticket-details" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ticket-categories" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ticket-subcategories" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="create-new-ticket" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="community-events" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="community-event" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="community-registration-confirmed"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen name="component-showcase" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="server-error" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </AppProviders>
  );
}
