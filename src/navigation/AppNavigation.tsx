import { espacio, tipografia, medidas, c } from '../tema';
import { MiAnioScreen } from '../screens/MiAnioScreen';

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

import { useSafeAreaInsets } from 'react-native-safe-area-context';
const Stack = createNativeStackNavigator<RootParams>();
const Tabs = createBottomTabNavigator<TabParams>();
const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: c.bg,
    card: c.bg,
    text: c.text,
    primary: c.accent,
    border: c.line,
  },
};
function InicioTabs() {
  const insets = useSafeAreaInsets();
  const iconos: Record<keyof TabParams, React.ComponentProps<typeof Ionicons>['name']> = {
    Buscar: 'search-outline',
    MiAnio: 'calendar-outline',
    MiLista: 'bookmarks-outline',
    Acerca: 'person-circle-outline',
  };
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.bg,
          borderTopColor: c.line,
          paddingTop: espacio.s,
          paddingBottom: Math.max(insets.bottom, medidas.tabs.inferiorMinimo),
          height: medidas.tabs.alto + insets.bottom,
        },
        tabBarItemStyle: { minHeight: medidas.boton },
        tabBarLabelStyle: { fontSize: tipografia.ayuda, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={iconos[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tabs.Screen
        name="Buscar"
        component={BuscarScreen}
        options={{ title: 'Buscar', tabBarAccessibilityLabel: 'Buscar' }}
      />
      <Tabs.Screen
        name="MiLista"
        component={MiListaScreen}
        options={{ title: 'Mi lista', tabBarAccessibilityLabel: 'Mi lista' }}
      />
      <Tabs.Screen
        name="MiAnio"
        component={MiAnioScreen}
        options={{ title: 'Mi año', tabBarAccessibilityLabel: 'Mi año' }}
      />
      <Tabs.Screen
        name="Acerca"
        component={AcercaScreen}
        options={{ title: 'Acerca de', tabBarAccessibilityLabel: 'Acerca de' }}
      />
    </Tabs.Navigator>
  );
}
export function AppNavigation() {
  const { usuario, iniciando } = useCartelera();
  if (iniciando) return <Cargando texto="Abriendo tu cartelera…" />;
  if (!usuario) return <LoginScreen />;
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        key={usuario.uid}
        screenOptions={{
          headerStyle: { backgroundColor: c.bg },
          headerTintColor: c.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.bg },
          headerTitleStyle: { fontSize: tipografia.cuerpo },
        }}
      >
        <Stack.Screen name="Inicio" component={InicioTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Detalle" component={DetalleScreen} options={{ title: 'La ficha' }} />
        <Stack.Screen name="Editar" component={EditarScreen} options={{ title: 'Mi entrada' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
