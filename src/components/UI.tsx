import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { c, s } from '../theme';
export function Boton({ texto, onPress, disabled = false, cargando = false, secundario = false, peligro = false }:
  { texto: string; onPress: () => void; disabled?: boolean; cargando?: boolean; secundario?: boolean; peligro?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || cargando }}
    disabled={disabled || cargando} onPress={onPress}
    style={({ pressed }) => [styles.button, { backgroundColor: peligro ? '#3D2131' : secundario ? c.raised : c.accent,
      opacity: disabled || cargando ? 0.5 : pressed ? 0.8 : 1 }]}>
    {cargando ? <ActivityIndicator color={secundario ? c.accent : c.bg} /> :
      <Text style={[styles.buttonText, { color: peligro ? c.danger : secundario ? c.text : c.bg }]}>{texto}</Text>}
  </Pressable>;
}
export function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: activo }} onPress={onPress}
    style={({ pressed }) => [styles.chip, { backgroundColor: activo ? c.accentDark : c.panel,
      borderColor: activo ? c.accent : c.line, opacity: pressed ? 0.7 : 1 }]}>
    <Text style={{ color: activo ? c.accent : c.muted, fontWeight: '600', fontSize: 13 }}>{texto}</Text>
  </Pressable>;
}
export function Aviso({ texto, error = false }: { texto: string; error?: boolean }) {
  return <View accessibilityLiveRegion="polite" style={[styles.notice, { borderColor: error ? '#723C4C' : c.line }]}>
    <Ionicons name={error ? 'alert-circle-outline' : 'information-circle-outline'} size={20} color={error ? c.danger : c.accent} />
    <Text style={[s.body, { flex: 1, fontSize: 13, color: error ? c.danger : c.muted }]}>{texto}</Text>
  </View>;
}
export function Vacio({ titulo, texto, icono = 'film-outline' }: {
  titulo: string; texto: string; icono?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return <View style={styles.empty}>
    <View style={styles.emptyIcon}><Ionicons name={icono} size={32} color={c.accent} /></View>
    <Text style={[s.subtitle, { textAlign: 'center' }]}>{titulo}</Text>
    <Text style={[s.body, { textAlign: 'center', maxWidth: 310 }]}>{texto}</Text>
  </View>;
}
export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return <View style={styles.empty}><ActivityIndicator color={c.accent} size="large" /><Text style={s.body}>{texto}</Text></View>;
}
const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
  chip: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  notice: { backgroundColor: c.panel, borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  empty: { padding: 28, paddingVertical: 40, gap: 14, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 76, height: 76, borderRadius: 24, backgroundColor: c.panel, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});
