import React from 'react';
import { View } from 'react-native';
import { EstadoVisto, ETIQUETA_ESTADO } from '../types';
import { s } from '../theme';
import { Chip } from './UI';
export function SelectorEstado({ valor, onChange }: { valor: EstadoVisto; onChange: (estado: EstadoVisto) => void }) {
  const estados: EstadoVisto[] = ['por_ver', 'viendo', 'vista'];
  return <View style={s.wrap}>{estados.map(estado => <Chip key={estado} texto={ETIQUETA_ESTADO[estado]} activo={valor === estado} onPress={() => onChange(estado)} />)}</View>;
}
