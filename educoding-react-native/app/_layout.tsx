import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import useFonts from '@/hooks/useFonts';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsLoaded = useFonts();

   useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // 🚀 폰트가 로드되었을 때 스플래시 숨기기
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{flex: 1, justifyContent: "center", alignItems:"center", backgroundColor: "#000"}}>
        <ActivityIndicator size="large" color="#ffffff"/>
      </View>
    )
  }
  
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
