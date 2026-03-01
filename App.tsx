import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation';
import { boot } from './src/services';
import { colors } from './src/theme';

export default function App() {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    boot().then((result) => {
      if ('error' in result) {
        console.warn('Boot failed:', result.error.message);
      }
      setReady(true);
    });
  }, []);

  if (ready === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}
