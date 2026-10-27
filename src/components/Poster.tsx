import React, { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { imagenUrl } from '../services/tmdbService';
import { c } from '../theme';
export function Poster({ path, titulo, ancho = 86, grande = false, perfil = false }: {
  path: string | null; titulo: string; ancho?: number; grande?: boolean; perfil?: boolean;
}) {
  const [falloUri, setFalloUri] = useState<string | null>(null);
  const uri = imagenUrl(path, grande, perfil);
  const tamano = { width: ancho, height: perfil ? ancho : ancho * 1.5 };
  if (!uri || falloUri === uri) return <View accessibilityLabel={`Sin imagen: ${titulo}`} style={[styles.poster, styles.placeholder, tamano]}>
    <Ionicons name={perfil ? 'person-outline' : 'film-outline'} size={Math.min(ancho / 2, 42)} color={c.muted} />
  </View>;
  return <Image source={{ uri }} accessibilityLabel={titulo} resizeMode="cover" onError={() => setFalloUri(uri)} style={[styles.poster, tamano]} />;
}
const styles = StyleSheet.create({ poster: { borderRadius: 12, backgroundColor: c.raised },
  placeholder: { justifyContent: 'center', alignItems: 'center' } });
