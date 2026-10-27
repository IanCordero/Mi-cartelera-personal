import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ETIQUETA_ESTADO, ItemLista, Obra } from '../types';
import { c, s } from '../theme';
import { Poster } from './Poster';
export function TarjetaObra({ obra, entrada, onPress }: { obra: Obra; entrada?: ItemLista; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${obra.titulo}, ${obra.tipo === 'movie' ? 'película' : 'serie'}, ${obra.anio || 'sin año'}`}
    onPress={onPress} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}>
    <Poster path={obra.posterPath} titulo={obra.titulo} ancho={76} />
    <View style={styles.info}>
      <Text style={styles.type}>{obra.tipo === 'movie' ? 'PELÍCULA' : 'SERIE'} · {obra.anio || 'SIN AÑO'}</Text>
      <Text style={styles.title} numberOfLines={2}>{obra.titulo}</Text>
      {entrada ? <>
        <Text style={styles.status}>{ETIQUETA_ESTADO[entrada.estado]}</Text>
        {entrada.calificacionPersonal !== null && <Text accessibilityLabel={`${entrada.calificacionPersonal} de 5 estrellas`} style={{ color: c.accent }}>
          {'★'.repeat(entrada.calificacionPersonal)}{'☆'.repeat(5 - entrada.calificacionPersonal)}
        </Text>}
      </> : <Text style={[s.body, { fontSize: 12 }]}>Ver ficha <Ionicons name="arrow-forward" size={12} /></Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color={c.muted} />
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 13, borderRadius: 18, backgroundColor: c.panel, borderWidth: 1, borderColor: c.line },
  info: { flex: 1, gap: 7 }, title: { color: c.text, fontSize: 17, fontWeight: '700' },
  type: { color: c.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 },
  status: { color: c.success, fontSize: 12, fontWeight: '600' },
});
