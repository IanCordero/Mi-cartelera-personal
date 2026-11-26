import { StyleSheet } from 'react-native';
import {
  colores,
  espacio as e,
  tipografia as t,
  radio as r,
  medidas as m,
  lineas,
  peso,
} from './tokens';
export * from './tokens';
export const c = {
  bg: colores.fondo,
  panel: colores.superficie,
  raised: colores.elevada,
  line: colores.borde,
  text: colores.texto,
  muted: colores.textoSecundario,
  accent: colores.acento,
  accentDark: colores.acentoSuave,
  success: colores.vista,
  danger: colores.error,
};
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  content: { padding: e.xl, gap: e.l, paddingBottom: e.amplio },
  title: { color: c.text, fontSize: t.titulo, fontWeight: peso.destacado },
  subtitle: { color: c.text, fontSize: t.seccion, fontWeight: peso.fuerte },
  body: { color: c.muted, fontSize: t.cuerpo, lineHeight: lineas.cuerpo },
  label: { color: c.text, fontSize: t.etiqueta, fontWeight: peso.medio, marginBottom: e.s },
  eyebrow: { color: c.accent, fontSize: t.ayuda, fontWeight: peso.destacado },
  input: {
    minHeight: m.boton,
    borderRadius: r.control,
    borderWidth: m.borde,
    borderColor: c.line,
    paddingHorizontal: e.l,
    paddingVertical: e.m,
    color: c.text,
    backgroundColor: c.panel,
    fontSize: t.cuerpo,
  },
  panel: {
    padding: e.xl,
    backgroundColor: c.panel,
    borderRadius: r.tarjeta,
    gap: e.m,
    borderWidth: m.borde,
    borderColor: c.line,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: e.m },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: e.s },
});
