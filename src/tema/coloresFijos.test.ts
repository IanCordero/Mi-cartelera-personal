import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const raiz = fileURLToPath(new URL('../../', import.meta.url));
const extensiones = /\.(?:[cm]?[jt]sx?)$/;
function archivos(carpeta: string): string[] {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(carpeta, entrada.name);
    const relativa = path.relative(raiz, ruta).split(path.sep).join('/');
    if (relativa === 'src/tema') return [];
    return entrada.isDirectory() ? archivos(ruta) : extensiones.test(ruta) ? [ruta] : [];
  });
}

it('ningún archivo de la app fuera de src/tema escribe un color hexadecimal', () => {
  const infracciones: string[] = [];
  for (const ruta of [...archivos(path.join(raiz, 'src')), path.join(raiz, 'App.tsx')]) {
    const texto = readFileSync(ruta, 'utf8');
    const colores = /#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})\b/gi;
    for (const coincidencia of texto.matchAll(colores)) {
      const linea = texto.slice(0, coincidencia.index).split('\n').length;
      infracciones.push(`${path.relative(raiz, ruta)}:${linea} ${coincidencia[0]}`);
    }
  }
  expect(
    infracciones,
    'Mover estos valores a src/tema según DESIGN.md; no excluir archivos ni desactivar el sensor.',
  ).toEqual([]);
});
