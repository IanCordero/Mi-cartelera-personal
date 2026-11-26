import { espacio, tipografia, radio, medidas, interaccion, c, s } from '../tema';

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ETIQUETA_ESTADO, ItemLista, Obra } from '../types';

import { Poster } from './Poster';
export function TarjetaObra({
  obra,
  entrada,
  onPress,
}: {
  obra: Obra;
  entrada?: ItemLista;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${obra.titulo}, ${obra.tipo === 'movie' ? 'película' : 'serie'}, ${obra.anio || 'sin año'}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? interaccion.presionado : 1 }]}
    >
      <Poster path={obra.posterPath} titulo={obra.titulo} ancho={medidas.poster.lista} />
      <View style={styles.info}>
        <Text style={styles.type}>
          {obra.tipo === 'movie' ? 'PELÍCULA' : 'SERIE'} · {obra.anio || 'SIN AÑO'}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {obra.titulo}
        </Text>
        {entrada ? (
          <>
            <Text style={styles.status}>{ETIQUETA_ESTADO[entrada.estado]}</Text>
            {entrada.calificacionPersonal !== null && (
              <Text
                accessibilityLabel={`${entrada.calificacionPersonal} de 5 estrellas`}
                style={{ color: c.accent }}
              >
                {'★'.repeat(entrada.calificacionPersonal)}
                {'☆'.repeat(5 - entrada.calificacionPersonal)}
              </Text>
            )}
          </>
        ) : (
          <Text style={[s.body, { fontSize: tipografia.ayuda }]}>
            Ver ficha <Ionicons name="arrow-forward" size={medidas.iconoMini} />
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={medidas.iconoPequeno} color={c.muted} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.l,
    padding: espacio.m,
    borderRadius: radio.tarjeta,
    backgroundColor: c.panel,
    borderWidth: 1,
    borderColor: c.line,
  },
  info: { flex: 1, gap: espacio.s },
  title: { color: c.text, fontSize: tipografia.cuerpo, fontWeight: '700' },
  type: { color: c.muted, fontSize: tipografia.ayuda, fontWeight: '700', letterSpacing: 1.1 },
  status: { color: c.success, fontSize: tipografia.ayuda, fontWeight: '600' },
});
