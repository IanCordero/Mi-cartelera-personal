import { espacio, tipografia, medidas, interaccion, c, s } from '../tema';

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function Estrellas({
  valor,
  disabled,
  onChange,
}: {
  valor: number | null;
  disabled: boolean;
  onChange: (valor: number | null) => void;
}) {
  return (
    <View style={{ gap: espacio.s }}>
      <View
        style={[
          s.row,
          { gap: espacio.xs, opacity: disabled ? interaccion.estrellasDeshabilitadas : 1 },
        ]}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`${n} de 5 estrellas`}
            accessibilityState={{ selected: valor === n, disabled }}
            disabled={disabled}
            onPress={() => onChange(n)}
            style={{
              width: medidas.boton,
              height: medidas.boton,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={n <= (valor ?? 0) ? 'star' : 'star-outline'}
              size={medidas.iconoGrande}
              color={c.accent}
            />
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || valor === null}
        onPress={() => onChange(null)}
        style={{ minHeight: medidas.tactilMinimo, justifyContent: 'center' }}
      >
        <Text
          style={{
            color: disabled || valor === null ? c.muted : c.accent,
            fontSize: tipografia.etiqueta,
          }}
        >
          Quitar calificación
        </Text>
      </Pressable>
    </View>
  );
}
