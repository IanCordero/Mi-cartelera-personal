import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { c, s } from '../theme';
export function Estrellas({ valor, disabled, onChange }: { valor: number | null; disabled: boolean; onChange: (valor: number | null) => void }) {
  return <View style={{ gap: 10 }}>
    <View style={[s.row, { gap: 4, opacity: disabled ? 0.35 : 1 }]}>
      {[1, 2, 3, 4, 5].map(n => <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} de 5 estrellas`}
        accessibilityState={{ selected: valor === n, disabled }} disabled={disabled} onPress={() => onChange(n)}
        style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name={n <= (valor ?? 0) ? 'star' : 'star-outline'} size={32} color={c.accent} />
      </Pressable>)}
    </View>
    <Pressable accessibilityRole="button" disabled={disabled || valor === null} onPress={() => onChange(null)} style={{ minHeight: 44, justifyContent: 'center' }}>
      <Text style={{ color: disabled || valor === null ? c.muted : c.accent, fontSize: 13 }}>Quitar calificación</Text>
    </Pressable>
  </View>;
}
