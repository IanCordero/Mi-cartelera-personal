import { StyleSheet } from 'react-native';
export const c = { bg: '#0B0E17', panel: '#151B2A', raised: '#1D2538', line: '#2D374D', text: '#F4F5FA',
  muted: '#A4AEC4', accent: '#AEABFF', accentDark: '#34315C', success: '#8DE0BD', danger: '#FF9AAB' };
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg }, content: { padding: 22, gap: 18, paddingBottom: 40 },
  title: { color: c.text, fontSize: 30, fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: c.text, fontSize: 20, fontWeight: '700' },
  body: { color: c.muted, fontSize: 15, lineHeight: 23 },
  label: { color: c.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  eyebrow: { color: c.accent, fontSize: 11, fontWeight: '800', letterSpacing: 2.3 },
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: c.line,
    paddingHorizontal: 16, paddingVertical: 14, color: c.text, backgroundColor: c.panel, fontSize: 16 },
  panel: { padding: 20, backgroundColor: c.panel, borderRadius: 20, gap: 12, borderWidth: 1, borderColor: c.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
