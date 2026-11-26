import { readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const prettier = require('prettier');

// El hook recibe JSON de Claude Code por stdin. Nunca inspecciona content,
// transcripciones ni credenciales. Solo usa la ruta del archivo editado.
let entrada = '';
for await (const fragmento of process.stdin) entrada += fragmento;
try {
  const evento = JSON.parse(entrada);
  const rutas = [evento.tool_input?.file_path, evento.tool_response?.filePath].filter(
    (valor) => typeof valor === 'string',
  );
  const raiz = await realpath(process.cwd());
  const extensiones = new Set([
    '.ts',
    '.tsx',
    '.mts',
    '.cts',
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
    '.json',
    '.md',
    '.html',
    '.css',
    '.yml',
    '.yaml',
  ]);
  for (const recibida of new Set(rutas)) {
    const candidata = path.resolve(raiz, recibida);
    const relativa = path.relative(raiz, candidata);
    const segmentos = relativa.split(path.sep);
    if (
      relativa.startsWith('..') ||
      path.isAbsolute(relativa) ||
      segmentos.some(
        (parte) =>
          parte.startsWith('.env') ||
          ['node_modules', '.git', '.expo', 'dist', 'coverage'].includes(parte),
      ) ||
      !extensiones.has(path.extname(candidata))
    )
      continue;
    const canonica = await realpath(candidata);
    const relativaCanonica = path.relative(raiz, canonica);
    if (
      relativaCanonica.startsWith('..') ||
      path.isAbsolute(relativaCanonica) ||
      relativaCanonica
        .split(path.sep)
        .some(
          (parte) =>
            parte.startsWith('.env') ||
            ['node_modules', '.git', '.expo', 'dist', 'coverage'].includes(parte),
        )
    )
      continue;
    const configuracion = await prettier.resolveConfig(canonica);
    const original = await readFile(canonica, 'utf8');
    const formateado = await prettier.format(original, { ...configuracion, filepath: canonica });
    if (original !== formateado) await writeFile(canonica, formateado);
  }
} catch (error) {
  // Un fallo de formato se informa al agente y no se oculta como éxito.
  console.error(
    `No se pudo aplicar Prettier: ${error instanceof Error ? error.message : 'entrada inválida'}`,
  );
  process.exitCode = 2;
}
