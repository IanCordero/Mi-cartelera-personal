import { radio, medidas, c } from '../tema';

import React, { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { imagenUrl } from '../services/tmdbService';

export function Poster({
  path,
  titulo,
  ancho = medidas.poster.base,
  grande = false,
  perfil = false,
}: {
  path: string | null;
  titulo: string;
  ancho?: number;
  grande?: boolean;
  perfil?: boolean;
}) {
  const [falloUri, setFalloUri] = useState<string | null>(null);
  const uri = imagenUrl(path, grande, perfil);
  const tamano = { width: ancho, height: perfil ? ancho : ancho * medidas.poster.aspecto };
  if (!uri || falloUri === uri)
    return (
      <View
        accessibilityLabel={`Sin imagen: ${titulo}`}
        style={[styles.poster, styles.placeholder, tamano]}
      >
        <Ionicons
          name={perfil ? 'person-outline' : 'film-outline'}
          size={Math.min(ancho / 2, medidas.iconoVacio)}
          color={c.muted}
        />
      </View>
    );
  return (
    <Image
      source={{ uri }}
      accessibilityLabel={titulo}
      resizeMode="cover"
      onError={() => setFalloUri(uri)}
      style={[styles.poster, tamano]}
    />
  );
}
const styles = StyleSheet.create({
  poster: { borderRadius: radio.poster, backgroundColor: c.raised },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
});
