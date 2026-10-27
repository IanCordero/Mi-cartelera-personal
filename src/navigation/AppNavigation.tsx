import React from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootParams, TabParams } from './types';
import { useCartelera } from '../context/CarteleraContext';
import { LoginScreen } from '../screens/LoginScreen';
import { BuscarScreen } from '../screens/BuscarScreen';
import { MiListaScreen } from '../screens/MiListaScreen';
import { DetalleScreen } from '../screens/DetalleScreen';
import { EditarScreen } from '../screens/EditarScreen';
import { AcercaScreen } from '../screens/AcercaScreen';
import { Cargando } from '../components/UI';
import { c } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const Stack = createNativeStackNavigator<RootParams>();
const Tabs = createBottomTabNavigator<TabParams>();
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: c.bg, card: c.bg, text: c.text, primary: c.accent, border: c.line } };
function InicioTabs() {
  const insets = useSafeAreaInsets();
  const iconos: Record<keyof TabParams, React.ComponentProps<typeof Ionicons>['name']> = {
    Buscar: 'search-outline', MiLista: 'bookmarks-outline', Acerca: 'person-circle-outline',
  };
  return <Tabs.Navigator screenOptions={({ route }) => ({
    headerShown: false, tabBarActiveTintColor: c.accent, tabBarInactiveTintColor: c.muted,
    tabBarStyle: { backgroundColor: c.bg, borderTopColor: c.line, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12), height: 76 + insets.bottom },
    tabBarItemStyle: { minHeight: 48 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    tabBarIcon: ({ color, size }) => <Ionicons name={iconos[route.name]} color={color} size={size} />,
  })}>
    <Tabs.Screen name="Buscar" component={BuscarScreen} options={{ title: 'Buscar' }} />
    <Tabs.Screen name="MiLista" component={MiListaScreen} options={{ title: 'Mi lista' }} />
    <Tabs.Screen name="Acerca" component={AcercaScreen} options={{ title: 'Acerca de' }} />
  </Tabs.Navigator>;
}
export function AppNavigation() {
  const { usuario, iniciando } = useCartelera();
  if (iniciando) return <Cargando texto="Abriendo tu cartelera…" />;
  if (!usuario) return <LoginScreen />;
  return <NavigationContainer theme={theme}>
    <Stack.Navigator key={usuario.uid} screenOptions={{ headerStyle: { backgroundColor: c.bg }, headerTintColor: c.text,
      headerShadowVisible: false, contentStyle: { backgroundColor: c.bg }, headerTitleStyle: { fontSize: 16 },
    }}>
      <Stack.Screen name="Inicio" component={InicioTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Detalle" component={DetalleScreen} options={{ title: 'La ficha' }} />
      <Stack.Screen name="Editar" component={EditarScreen} options={{ title: 'Mi entrada' }} />
    </Stack.Navigator>
  </NavigationContainer>;
}
