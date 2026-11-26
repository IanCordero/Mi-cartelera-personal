import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ItemLista } from '../types';
import type { PreferenciaAnual } from '../dominio/resumenAnual';
import { c, s, colores, espacio as e, medidas as m, tipografia as t, radio } from '../tema';
import { Boton, Chip } from './UI';
import { Poster } from './Poster';

export const MESES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];
export function SelectorAnio({
  anios,
  valor,
  onChange,
}: {
  anios: number[];
  valor: number;
  onChange: (anio: number) => void;
}) {
  return (
    <View style={{ gap: e.s }}>
      <Text style={s.label}>Tu año</Text>
      <View style={s.wrap}>
        {anios.map((anio) => (
          <Chip
            key={anio}
            texto={String(anio)}
            activo={anio === valor}
            onPress={() => onChange(anio)}
          />
        ))}
      </View>
    </View>
  );
}
export function TarjetaDato({
  etiqueta,
  cifra,
  contexto,
  protagonista = false,
}: {
  etiqueta: string;
  cifra: string;
  contexto: string;
  protagonista?: boolean;
}) {
  return (
    <View style={[s.panel, protagonista && styles.protagonista]}>
      <Text style={s.label}>{etiqueta}</Text>
      <Text style={styles.dato}>{cifra}</Text>
      <Text style={s.body}>{contexto}</Text>
    </View>
  );
}
export function Preferencia({
  etiqueta,
  dato,
  sinDatos,
}: {
  etiqueta: string;
  dato: PreferenciaAnual | null;
  sinDatos: string;
}) {
  return (
    <View style={s.panel}>
      <Text style={s.eyebrow}>{etiqueta}</Text>
      <Text style={s.subtitle}>{dato?.nombre ?? 'Sin datos todavía'}</Text>
      <Text style={s.body}>
        {dato ? `${dato.obras} ${dato.obras === 1 ? 'obra' : 'obras'}` : sinDatos}
      </Text>
    </View>
  );
}
export function BarrasMes({ cantidades, mesTop }: { cantidades: number[]; mesTop: number | null }) {
  const maximo = Math.max(1, ...cantidades);
  return (
    <View style={s.panel}>
      <Text style={s.subtitle}>Tu ritmo de historias</Text>
      <Text style={s.body}>
        {mesTop === null
          ? 'Todavía no hay un mes destacado.'
          : `Mes más activo: ${MESES[mesTop]} · ${cantidades[mesTop]} obras`}
      </Text>
      <View style={styles.grafico}>
        {MESES.map((nombre, mes) => (
          <View
            key={nombre}
            accessible
            accessibilityLabel={`${nombre}: ${cantidades[mes]} obras${mesTop === mes ? ', mes más activo' : ''}`}
            style={styles.columna}
          >
            <Text style={styles.cantidad}>{cantidades[mes]}</Text>
            <View style={styles.pista}>
              <View
                style={{
                  width: '100%',
                  maxWidth: m.grafico.anchoMaximo,
                  height: Math.max(m.grafico.minimo, (cantidades[mes] / maximo) * m.grafico.maximo),
                  backgroundColor: mesTop === mes ? colores.vista : c.accent,
                  borderRadius: radio.control,
                }}
              />
            </View>
            <Text style={styles.mes}>{nombre}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
export function ObraDestacada({
  obra,
  onEditar,
  onLista,
}: {
  obra: ItemLista | null;
  onEditar: (id: string) => void;
  onLista: () => void;
}) {
  return (
    <View style={s.panel}>
      <Text style={s.eyebrow}>LA QUE SE QUEDÓ CONTIGO</Text>
      {obra ? (
        <>
          <View style={[s.row, { alignItems: 'flex-start' }]}>
            <Poster path={obra.posterPath} titulo={obra.titulo} ancho={m.poster.destacada} />
            <View style={{ flex: 1, gap: e.m }}>
              <Text style={s.subtitle}>{obra.titulo}</Text>
              <Text style={s.body}>
                {obra.tipo === 'movie' ? 'Película' : 'Serie'} · {obra.anio || 'Sin año'}
              </Text>
              <Text
                accessibilityLabel={`${obra.calificacionPersonal} de 5 estrellas personales`}
                style={{ color: c.accent, fontSize: t.seccion }}
              >
                {'★'.repeat(obra.calificacionPersonal ?? 0)}
              </Text>
            </View>
          </View>
          <Boton texto="Ver mi entrada" secundario onPress={() => onEditar(obra.id)} />
        </>
      ) : (
        <>
          <Text style={s.subtitle}>Tu favorita espera sus estrellas</Text>
          <Text style={s.body}>
            Califica una obra Vista para descubrir la destacada de este año.
          </Text>
          <Boton texto="Ir a Mi lista" secundario onPress={onLista} />
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  protagonista: { backgroundColor: c.accentDark, borderRadius: radio.destacada },
  dato: { fontSize: t.dato, fontWeight: '800', color: c.text },
  grafico: { flexDirection: 'row', alignItems: 'flex-end', gap: e.xs },
  columna: { flex: 1, minWidth: 0, alignItems: 'center', gap: e.s },
  pista: {
    height: m.grafico.maximo,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cantidad: { fontSize: t.ayuda, color: c.text },
  mes: { fontSize: t.ayuda, color: c.muted },
});
