import React, { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartelera } from '../context/CarteleraContext';
import { Aviso, Boton } from '../components/UI';
import { TmdbLogo } from '../components/TmdbLogo';
import { c, s } from '../theme';
import { mensajeError } from '../utils/errors';
export function AcercaScreen() {
  const { usuario, cerrarSesion, operacionPendiente } = useCartelera();
  const [error, setError] = useState<string | null>(null);
  const [saliendo, setSaliendo] = useState(false);
  async function salir() {
    setSaliendo(true); setError(null);
    try { await cerrarSesion(); } catch (e) { setError(mensajeError(e)); } finally { setSaliendo(false); }
  }
  return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <Text style={s.eyebrow}>HECHA PARA TUS HISTORIAS</Text><Text style={s.title}>Detrás de la pantalla.</Text>
    <View style={s.panel}><Ionicons name="film-outline" size={42} color={c.accent} /><Text style={[s.subtitle, { fontSize: 26 }]}>Mi Cartelera Personal</Text>
      <Text style={s.body}>Versión 1.0.0 · Proyecto académico</Text><Text style={s.body}>Descubre, guarda y recuerda las películas y series que forman parte de tu historia.</Text>
    </View>
    <View style={s.panel}><Text style={s.label}>Tu cuenta</Text><Text selectable style={s.body}>{usuario?.email}</Text>
      <Text style={[s.body, { fontSize: 12 }]}>Tu lista es privada. La copia local permanece en este dispositivo y se separa por cuenta.</Text>
    </View>
    <View style={s.panel}><Text style={s.label}>Catálogo y créditos</Text>
      <TmdbLogo />
      <Text style={s.body}>Las fichas, calificaciones, imágenes y datos del elenco provienen de The Movie Database (TMDB).</Text>
      <Text style={[s.body, { fontSize: 12 }]}>This product uses the TMDB API but is not endorsed or certified by TMDB.</Text>
      <Boton texto="Visitar TMDB" secundario onPress={() => { void Linking.openURL('https://www.themoviedb.org/').catch(() => setError('No se pudo abrir el navegador.')); }} />
    </View>
    {error && <Aviso texto={error} error />}
    {operacionPendiente && <Aviso texto="Espera a que termine la modificación antes de cerrar sesión." />}
    <Boton texto="Cerrar sesión" peligro cargando={saliendo} disabled={operacionPendiente} onPress={() => void salir()} />
  </ScrollView>;
}
