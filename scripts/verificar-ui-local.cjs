// Verificación opcional de UI con dependencias externas al paquete móvil.
// Ver docs/evidencia/PROCEDIMIENTO-UI.md. Datos ficticios, solo demo-cartelera.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { createRequire } = require('node:module');
const repo = path.resolve(path.dirname(process.argv[1]), '..');
const exportacion = path.resolve(process.env.CARTELERA_WEB_EXPORT || path.join(repo, 'dist-ui'));
const req = createRequire(repo + '/package.json');
const { initializeTestEnvironment } = req('@firebase/rules-unit-testing');
const { doc, setDoc, getDoc, Timestamp, updateDoc, serverTimestamp } = req('firebase/firestore');
const { chromium } = require(process.env.CARTELERA_PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const out = repo + '/docs/evidencia';
const logs = [];
const check = (nombre, cond) => {
  assert.ok(cond, nombre);
  logs.push('PASS ' + nombre);
};
(async () => {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const file = path.join(
      exportacion,
      decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname),
    );
    if (!file.startsWith(exportacion + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        response.writeHead(404).end();
        return;
      }
      response.setHeader(
        'Content-Type',
        {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.ttf': 'font/ttf',
          '.png': 'image/png',
          '.woff': 'font/woff',
        }[path.extname(file)] || 'application/octet-stream',
      );
      response.end(data);
    });
  });
  await new Promise((r) => server.listen(8765, '127.0.0.1', r));
  const browser = await chromium.launch({
    executablePath: process.env.CARTELERA_CHROME || undefined,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    timezoneId: 'America/Guayaquil',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let concurrent = 0,
    maxConcurrent = 0;
  const calls = [];
  let fallo = true;
  await context.route('https://api.themoviedb.org/3/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/configuration')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          images: {
            secure_base_url: 'https://image.tmdb.org/t/p/',
            poster_sizes: ['w185', 'w500'],
            profile_sizes: ['w185'],
          },
        }),
      });
      return;
    }
    calls.push(url.pathname);
    concurrent++;
    maxConcurrent = Math.max(maxConcurrent, concurrent);
    await new Promise((r) => setTimeout(r, 140));
    const id = Number(url.pathname.split('/').pop());
    if (id === 103 && fallo)
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"status_message":"Fallo de prueba"}',
      });
    else {
      if (id === 103 && !fallo)
        await updateDoc(
          doc(env.authenticatedContext(uid).firestore(), `usuarios/${uid}/mi_lista/movie_103`),
          {
            comentario: 'Comentario concurrente',
            calificacionPersonal: 4,
            actualizadoEn: serverTimestamp(),
          },
        );
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id,
          title: 'Historia ' + id,
          name: 'Historia ' + id,
          release_date: '2020-01-01',
          first_air_date: '2020-01-01',
          poster_path: null,
          overview: 'Historia de prueba local.',
          vote_average: 8,
          vote_count: 10,
          runtime: 90,
          genres: [{ id: 1, name: 'Drama' }],
          credits: { cast: [], crew: [{ id: 1, name: 'Directora local', job: 'Director' }] },
        }),
      });
    }
    concurrent--;
  });
  await page.goto('http://127.0.0.1:8765');
  await page.getByRole('button', { name: 'Soy nuevo · Crear una cuenta' }).click();
  await page.getByLabel('Correo electrónico', { exact: true }).fill('ian-local@example.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local-123');
  await page.getByLabel('Confirma tu contraseña').fill('prueba-local-123');
  const signup = page.waitForResponse((r) => r.url().includes('accounts:signUp'));
  await page.getByRole('button', { name: 'Crear mi cuenta', exact: true }).click();
  const user = await (await signup).json();
  assert.ok(user.localId);
  const uid = user.localId;
  await page.getByRole('tab', { name: /Mi lista/ }).waitFor();
  const env = await initializeTestEnvironment({
    projectId: 'demo-cartelera',
    firestore: {
      rules: fs.readFileSync(repo + '/firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
  const legacy = (id, tipo, fecha, nota) => ({
    tmdbId: id,
    tipo,
    titulo: 'Historia ' + id,
    anio: '2020',
    posterPath: null,
    estado: 'vista',
    calificacionPersonal: nota,
    comentario: 'Comentario original ' + id,
    agregadoEn: Timestamp.fromDate(new Date(fecha)),
    actualizadoEn: Timestamp.fromDate(new Date(fecha)),
  });
  await env.withSecurityRulesDisabled(async (c) => {
    for (const [id, tipo, fecha, nota] of [
      [101, 'movie', '2025-01-02T12:00:00Z', 5],
      [102, 'tv', '2025-03-02T12:00:00Z', 4],
      [103, 'movie', '2025-03-03T12:00:00Z', 3],
      [104, 'movie', '2024-01-02T12:00:00Z', null],
    ])
      await setDoc(
        doc(c.firestore(), `usuarios/${uid}/mi_lista/${tipo}_${id}`),
        legacy(id, tipo, fecha, nota),
      );
  });
  await page.getByRole('tab', { name: /Mi lista/ }).click();
  await page.getByRole('button', { name: 'Actualizar lista', exact: true }).click();
  await page.getByText('Historia 101', { exact: true }).waitFor();
  await page.getByRole('tab', { name: /Mi año/ }).click();
  const actual = new Date().getFullYear();
  await page.getByText('Tu año todavía tiene historias por descubrir', { exact: true }).waitFor();
  await page.getByRole('button', { name: '2025', exact: true }).waitFor();
  check(
    'año actual inicial y estado vacío',
    await page.getByText(`Las historias que hicieron tu ${actual}.`, { exact: true }).isVisible(),
  );
  check('migración previa no pide TMDB para otros años', calls.length === 0);
  await page.screenshot({ path: out + '/resumen-vacio-local.png' });
  await page.getByRole('button', { name: '2025', exact: true }).click();
  await page.getByText('1 obras con datos pendientes.', { exact: false }).waitFor();
  await page.getByText('Tu ritmo de historias', { exact: true }).waitFor();
  await page.waitForFunction(() => !document.body.innerText.includes('Completando datos'));
  check(
    'totales incluyen película cuyo TMDB falló',
    await page.getByText('2 películas · 1 serie', { exact: true }).isVisible(),
  );
  check('una petición TMDB activa como máximo', maxConcurrent === 1);
  check(
    'solo se enriquece el año seleccionado',
    calls.length === 3 && !calls.some((p) => p.endsWith('/104')),
  );
  check(
    'horas solo de películas con datos completos',
    await page.getByText('1,5 h', { exact: true }).isVisible(),
  );
  check(
    'doce barras accesibles incluidas las de cero',
    (await page.getByLabel(/obras(, mes más activo)?$/).count()) === 12,
  );
  check(
    'sin desbordamiento horizontal',
    await page.evaluate(() => document.documentElement.scrollWidth <= 390),
  );
  await page.screenshot({ path: out + '/resumen-parcial-local.png' });
  let saved;
  await env.withSecurityRulesDisabled(async (c) => {
    saved = (await getDoc(doc(c.firestore(), `usuarios/${uid}/mi_lista/movie_101`))).data();
    const other = (await getDoc(doc(c.firestore(), `usuarios/${uid}/mi_lista/movie_104`))).data();
    check(
      'fecha heredada exacta y opinión preservada',
      saved.vistaEn.toDate().toISOString() === '2025-01-02T12:00:00.000Z' &&
        saved.comentario === 'Comentario original 101' &&
        saved.calificacionPersonal === 5,
    );
    check(
      'migra fechas de todos los años sin enriquecer otro año',
      !!other.vistaEn && !('generos' in other),
    );
  });
  fallo = false;
  await page.getByRole('button', { name: 'Reintentar resumen', exact: true }).click();
  await page.getByText('3,0 h', { exact: true }).waitFor();
  check('reintenta solo metadatos pendientes', calls.length === 4 && calls.at(-1).endsWith('/103'));
  await env.withSecurityRulesDisabled(async (c) => {
    const d = (await getDoc(doc(c.firestore(), `usuarios/${uid}/mi_lista/movie_103`))).data();
    check(
      'metadatos preservan edición concurrente de otro dispositivo',
      d.comentario === 'Comentario concurrente' &&
        d.calificacionPersonal === 4 &&
        d.generos.includes('Drama'),
    );
  });
  await page.screenshot({ path: out + '/resumen-datos-local.png' });
  await page.mouse.move(195, 650);
  await page.mouse.wheel(0, 1400);
  await page.waitForTimeout(250);
  const tabBox = await page.getByRole('tab', { name: /Mi año/ }).boundingBox();
  check(
    'pestañas permanecen en pantalla al desplazar el resumen',
    tabBox && tabBox.y >= 0 && tabBox.y + tabBox.height <= 844,
  );
  await page.screenshot({ path: out + '/resumen-meses-local.png' });
  const antes = calls.length;
  await page.getByRole('button', { name: 'Ver mi entrada', exact: true }).click();
  await page.getByLabel('Comentario personal', { exact: true }).fill('Editado desde la interfaz');
  await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
  await page.getByText('Mi año en cine.', { exact: true }).waitFor();
  await page.waitForTimeout(500);
  await env.withSecurityRulesDisabled(async (c) => {
    const d = (await getDoc(doc(c.firestore(), `usuarios/${uid}/mi_lista/movie_101`))).data();
    check(
      'editar comentario desde destacada conserva fecha',
      d.vistaEn.isEqual(saved.vistaEn) && d.comentario === 'Editado desde la interfaz',
    );
  });
  check('no vuelve a pedir datos completos', calls.length === antes);
  await context.setOffline(true);
  await page.getByText(/Sin conexión. Mostramos la última copia guardada ·/).waitFor();
  await page.getByRole('button', { name: '2024', exact: true }).click();
  await page.getByText('1 película · 0 series', { exact: true }).waitFor();
  check('offline calcula otro año con caché y sin petición', calls.length === antes);
  await page.screenshot({ path: out + '/resumen-offline-local.png' });
  check(
    'AsyncStorage guarda copia privada con fechas y metadatos',
    await page.evaluate((uid) => {
      const v = JSON.parse(localStorage.getItem('@cartelera:v1:' + uid));
      return (
        v.items.length === 4 &&
        v.items.some((i) => i.id === 'movie_101' && i.vistaEn && i.generos.includes('Drama'))
      );
    }, uid),
  );
  await context.setOffline(false);
  await page.waitForTimeout(800);
  // Una cuenta distinta nunca recibe la colección anterior.
  await page.getByRole('tab', { name: /Acerca de/ }).click();
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await page.getByRole('button', { name: 'Soy nuevo · Crear una cuenta', exact: true }).click();
  await page.getByLabel('Correo electrónico', { exact: true }).fill('cuenta-b@example.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local-456');
  await page.getByLabel('Confirma tu contraseña').fill('prueba-local-456');
  await page.getByRole('button', { name: 'Crear mi cuenta', exact: true }).click();
  await page.getByRole('tab', { name: /Mi año/ }).click();
  await page.getByText('Tu año todavía tiene historias por descubrir', { exact: true }).waitFor();
  check(
    'cuenta B no muestra resumen de A',
    (await page.getByRole('button', { name: '2025', exact: true }).count()) === 0,
  );

  await page.getByRole('tab', { name: /Acerca de/ }).click();
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  const bloquearConsulta = async (route) =>
    route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({
        error: { code: 403, message: 'Fallo local controlado', status: 'PERMISSION_DENIED' },
      }),
    });
  await page.route(/127\.0\.0\.1:8080.*:runQuery/, bloquearConsulta);
  await page.getByRole('button', { name: 'Soy nuevo · Crear una cuenta', exact: true }).click();
  await page.getByLabel('Correo electrónico', { exact: true }).fill('sin-copia@example.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('prueba-local-789');
  await page.getByLabel('Confirma tu contraseña').fill('prueba-local-789');
  await page.getByRole('button', { name: 'Crear mi cuenta', exact: true }).click();
  await page.getByRole('tab', { name: /Mi año/ }).click();
  await page
    .getByText('No hay una copia guardada en este dispositivo. Conéctate y vuelve a intentarlo.', {
      exact: true,
    })
    .waitFor();
  check(
    'error sin copia se distingue del año vacío',
    (await page
      .getByText('Tu año todavía tiene historias por descubrir', { exact: true })
      .count()) === 0,
  );
  await page.screenshot({ path: out + '/resumen-error-local.png' });
  await page.unroute(/127\.0\.0\.1:8080.*:runQuery/, bloquearConsulta);
  await page.getByRole('button', { name: 'Reintentar resumen', exact: true }).click();
  await page.getByText('Tu año todavía tiene historias por descubrir', { exact: true }).waitFor();
  check('reintento recupera el resumen tras error inicial', true);
  check('sin errores de ejecución de JavaScript', errors.length === 0);
  fs.writeFileSync(
    out + '/documento-local.json',
    JSON.stringify(
      {
        procedencia: 'Firestore Emulator, cuenta ficticia; no es Firebase de producción',
        ...saved,
        vistaEn: saved.vistaEn.toDate().toISOString(),
        agregadoEn: saved.agregadoEn.toDate().toISOString(),
        actualizadoEn: saved.actualizadoEn.toDate().toISOString(),
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(out + '/H4-UI-local.txt', logs.join('\n') + '\n');
  console.log(logs.join('\n'));
  await env.cleanup();
  await browser.close();
  await new Promise((r) => server.close(r));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
