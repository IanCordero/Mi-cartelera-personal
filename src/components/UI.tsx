import { colores, espacio, tipografia, radio, medidas, interaccion, c, s } from '../tema';

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function Boton({
  texto,
  onPress,
  disabled = false,
  cargando = false,
  secundario = false,
  peligro = false,
}: {
  texto: string;
  onPress: () => void;
  disabled?: boolean;
  cargando?: boolean;
  secundario?: boolean;
  peligro?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || cargando }}
      disabled={disabled || cargando}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: peligro ? colores.fondoError : secundario ? c.raised : c.accent,
          opacity:
            disabled || cargando ? interaccion.deshabilitado : pressed ? interaccion.presionado : 1,
        },
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={secundario ? c.accent : c.bg} />
      ) : (
        <Text
          style={[styles.buttonText, { color: peligro ? c.danger : secundario ? c.text : c.bg }]}
        >
          {texto}
        </Text>
      )}
    </Pressable>
  );
}
export function Chip({
  texto,
  activo,
  onPress,
}: {
  texto: string;
  activo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: activo ? c.accentDark : c.panel,
          borderColor: activo ? c.accent : c.line,
          opacity: pressed ? interaccion.presionado : 1,
        },
      ]}
    >
      <Text
        style={{
          color: activo ? c.accent : c.muted,
          fontWeight: '600',
          fontSize: tipografia.etiqueta,
        }}
      >
        {texto}
      </Text>
    </Pressable>
  );
}
export function Aviso({ texto, error = false }: { texto: string; error?: boolean }) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.notice, { borderColor: error ? colores.error : c.line }]}
    >
      <Ionicons
        name={error ? 'alert-circle-outline' : 'information-circle-outline'}
        size={medidas.iconoAviso}
        color={error ? c.danger : c.accent}
      />
      <Text
        style={[
          s.body,
          { flex: 1, fontSize: tipografia.etiqueta, color: error ? c.danger : c.muted },
        ]}
      >
        {texto}
      </Text>
    </View>
  );
}
export function Vacio({
  titulo,
  texto,
  icono = 'film-outline',
}: {
  titulo: string;
  texto: string;
  icono?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icono} size={medidas.iconoGrande} color={c.accent} />
      </View>
      <Text style={[s.subtitle, { textAlign: 'center' }]}>{titulo}</Text>
      <Text style={[s.body, { textAlign: 'center', maxWidth: medidas.textoVacioMaximo }]}>
        {texto}
      </Text>
    </View>
  );
}
export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <View style={styles.empty}>
      <ActivityIndicator color={c.accent} size="large" />
      <Text style={s.body}>{texto}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: medidas.boton,
    borderRadius: radio.control,
    paddingHorizontal: espacio.xl,
    paddingVertical: espacio.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: tipografia.cuerpo, fontWeight: '800', textAlign: 'center' },
  chip: {
    minHeight: medidas.tactilMinimo,
    borderWidth: 1,
    borderRadius: radio.poster,
    paddingHorizontal: espacio.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    backgroundColor: c.panel,
    borderWidth: 1,
    borderRadius: radio.control,
    padding: espacio.l,
    flexDirection: 'row',
    gap: espacio.s,
    alignItems: 'flex-start',
  },
  empty: {
    padding: espacio.grande,
    paddingVertical: espacio.amplio,
    gap: espacio.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: medidas.vacioIcono,
    height: medidas.vacioIcono,
    borderRadius: radio.destacada,
    backgroundColor: c.panel,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacio.s,
  },
});
