import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { colores, espacio, medidas, radio, tipografia } from './tokens';
const propuesta = JSON.parse(
  readFileSync(new URL('../../docs/diseno/propuesta-visual.json', import.meta.url), 'utf8'),
) as {
  colores: Record<string, string>;
  espacios: number[];
  tipografia: Record<string, string | number>;
  radios: Record<string, number>;
  contrastes: { texto: keyof typeof colores; fondo: keyof typeof colores }[];
};
function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
describe('Tokens del diseño revisado', () => {
  it('paleta y escala coinciden con el brand board, sin otra fuente de valores en la app', () => {
    expect(colores).toEqual(propuesta.colores);
    expect(Object.values(espacio)).toEqual(propuesta.espacios);
    for (const [nombre, tamano] of Object.entries(tipografia))
      expect(propuesta.tipografia[nombre]).toBe(tamano);
    for (const nombre of ['control', 'tarjeta', 'destacada', 'pastilla'] as const)
      expect(radio[nombre]).toBe(propuesta.radios[nombre]);
    expect(medidas.tactilMinimo).toBeGreaterThanOrEqual(44);
  });
  it.each(propuesta.contrastes)('texto $texto sobre $fondo supera 4,5:1', ({ texto, fondo }) => {
    const a = luminancia(colores[texto]),
      b = luminancia(colores[fondo]);
    expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toBeGreaterThanOrEqual(4.5);
  });
  it('el contexto de la tarjeta protagonista conserva contraste suficiente', () => {
    const a = luminancia(colores.textoSecundario),
      b = luminancia(colores.acentoSuave);
    expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toBeGreaterThanOrEqual(4.5);
  });
});
