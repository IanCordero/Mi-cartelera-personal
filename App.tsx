import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CarteleraProvider } from './src/context/CarteleraContext';
import { AppNavigation } from './src/navigation/AppNavigation';
import { c } from './src/theme';
export default function App() {
  return <SafeAreaProvider><SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: c.bg }}>
    <StatusBar style="light" /><CarteleraProvider><AppNavigation /></CarteleraProvider>
  </SafeAreaView></SafeAreaProvider>;
}
