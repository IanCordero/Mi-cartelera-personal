const token = process.env.EXPO_PUBLIC_TMDB_TOKEN?.trim();
if (!token) { console.error('Completa EXPO_PUBLIC_TMDB_TOKEN en .env.'); process.exit(1); }
try {
  const response = await fetch('https://api.themoviedb.org/3/search/multi?query=Matrix&language=es-ES&include_adult=false', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`TMDB respondió HTTP ${response.status}. Revisa el token o espera si es 429.`);
  const data = await response.json();
  const first = data.results.find(item => ['movie', 'tv'].includes(item.media_type));
  console.log('Token verificado. Primer título:', first?.title ?? first?.name ?? 'Sin resultados', '· ID:', first?.id);
} catch (error) { console.error(error.message); process.exitCode = 1; }
