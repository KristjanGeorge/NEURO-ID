import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/auth.store.js';

import { AuthScreen } from '../screens/AuthScreen.js';
import { IdentityScreen } from '../screens/IdentityScreen.js';
import { WalletScreen } from '../screens/WalletScreen.js';
import { TokensScreen } from '../screens/TokensScreen.js';
import { TokenDetailScreen } from '../screens/TokenDetailScreen.js';
import { TransactionsScreen } from '../screens/TransactionsScreen.js';
import { SecondaryMarketScreen } from '../screens/SecondaryMarketScreen.js';
import { NeuroPocketScreen } from '../screens/NeuroPocketScreen.js';
import { DocumentScreen } from '../screens/DocumentScreen.js';
import { IIoTScreen } from '../screens/IIoTScreen.js';
import { QRScreen } from '../screens/QRScreen.js';
import { SupportScreen } from '../screens/SupportScreen.js';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const DARK_HEADER = {
  headerStyle: { backgroundColor: '#0A1628' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '700' as const },
};

function WalletStack() {
  return (
    <Stack.Navigator screenOptions={DARK_HEADER}>
      <Stack.Screen name="WalletHome" component={WalletScreen} options={{ title: 'Wallet' }} />
      <Stack.Screen name="TokenDetail" component={TokenDetailScreen} options={{ title: 'Token' }} />
    </Stack.Navigator>
  );
}

function PocketStack() {
  return (
    <Stack.Navigator screenOptions={DARK_HEADER}>
      <Stack.Screen name="PocketHome" component={NeuroPocketScreen} options={{ title: 'NeuroPocket' }} />
      <Stack.Screen name="Document" component={DocumentScreen} options={{ title: 'Documento' }} />
    </Stack.Navigator>
  );
}

function TokensStack() {
  return (
    <Stack.Navigator screenOptions={DARK_HEADER}>
      <Stack.Screen name="TokensList" component={TokensScreen} options={{ title: 'Tokens' }} />
      <Stack.Screen name="TokenDetail" component={TokenDetailScreen} options={{ title: 'Token' }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Soporte' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const TAB_ICONS: Record<string, string> = {
    ID: '🪪', Wallet: '💳', Tokens: '🏪', Mercado: '🔄', Pocket: '📁', QR: '📲', Soporte: '💬',
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => null,
        tabBarLabel: route.name,
        tabBarStyle: { backgroundColor: '#0A1628', borderTopColor: '#1E3A5F', height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#00C2FF',
        tabBarInactiveTintColor: '#8BA3C7',
        ...DARK_HEADER,
      })}
    >
      <Tab.Screen name="ID" component={IdentityScreen} />
      <Tab.Screen name="Wallet" component={WalletStack} options={{ headerShown: false }} />
      <Tab.Screen name="Tokens" component={TokensStack} options={{ headerShown: false }} />
      <Tab.Screen name="Mercado" component={SecondaryMarketScreen} />
      <Tab.Screen name="Pocket" component={PocketStack} options={{ headerShown: false }} />
      <Tab.Screen name="QR" component={QRScreen} />
      <Tab.Screen name="Soporte" component={SupportScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading, hydrateFromStorage } = useAuthStore();

  useEffect(() => { hydrateFromStorage(); }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#00C2FF" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#0D1F3C', justifyContent: 'center', alignItems: 'center' },
});
