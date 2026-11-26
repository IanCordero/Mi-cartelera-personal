import { espacio, tipografia, radio, medidas, c, s } from '../tema';

import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../navigation/types';
import { DetalleObra, EstadoPeticion } from '../types';
import { obtenerDetalle } from '../services/tmdbService';
import { useCartelera } from '../context/CarteleraContext';
import { Aviso, Boton, Cargando } from '../components/UI';
import { Poster } from '../components/Poster';

import { mensajeError } from '../utils/errors';
export function DetalleScreen(props: NativeStackScreenProps<RootParams, 'Detalle'>) {
  const [intento, setIntento] = useState(0);
  return (
    <DetalleContenido
      key={`${props.route.params.tipo}_${props.route.params.id}_${intento}`}
      {...props}
      reintentar={() => setIntento((n) => n + 1)}
    />
  );
}
function DetalleContenido({
  route,
  navigation,
  reintentar,
}: NativeStackScreenProps<RootParams, 'Detalle'> & { reintentar: () => void }) {
  const { tipo, id } = route.params;
  const { lista, agregar, conectado, operacionPendiente, cargandoLista } = useCartelera();
  const [estado, setEstado] = useState<EstadoPeticion<DetalleObra>>({ tipo: 'cargando' });
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const entrada = lista.find((item) => item.tipo === tipo && item.tmdbId === id);
  useEffect(() => {
    const controller = new AbortController();
    let vigente = true;
    void obtenerDetalle(tipo, id, controller.signal).then(
      (datos) => {
        if (vigente) setEstado({ tipo: 'exito', datos });
      },
      (e) => {
        if (vigente) setEstado({ tipo: 'error', mensaje: mensajeError(e) });
      },
    );
    return () => {
      vigente = false;
      controller.abort();
    };
  }, [tipo, id]);
  async function guardar(obra: DetalleObra) {
    setGuardando(true);
    setErrorGuardar(null);
    try {
      await agregar(obra);
      Alert.alert('Agregada a Mi lista', 'La guardamos con el estado Por ver.');
    } catch (e) {
      setErrorGuardar(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  }
  if (estado.tipo === 'cargando')
    return (
      <View style={s.screen}>
        <Cargando texto="Preparando la ficha…" />
      </View>
    );
  if (estado.tipo === 'error')
    return (
      <ScrollView style={s.screen} contentContainerStyle={s.content}>
        <Aviso texto={estado.mensaje} error />
        <Boton texto="Reintentar" onPress={reintentar} />
      </ScrollView>
    );
  const obra = estado.datos;
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <View style={[s.row, { alignItems: 'flex-start', gap: espacio.xl }]}>
        <Poster path={obra.posterPath} titulo={obra.titulo} ancho={medidas.poster.detalle} grande />
        <View style={{ flex: 1, gap: espacio.m, paddingTop: espacio.s }}>
          <Text style={s.eyebrow}>{obra.tipo === 'movie' ? 'PELÍCULA' : 'SERIE'}</Text>
          <Text style={[s.subtitle, { fontSize: tipografia.seccion }]}>{obra.titulo}</Text>
          <Text style={s.body}>
            {obra.anio || 'Año no disponible'}
            {obra.duracion ? ` · ${obra.duracion} min` : ''}
          </Text>
          <Text style={{ color: c.accent, fontSize: tipografia.cuerpo, fontWeight: '800' }}>
            ★ {obra.votos ? `${obra.puntuacion.toFixed(1)} / 10` : 'Sin votos'}
          </Text>
          <Text style={[s.body, { fontSize: tipografia.ayuda }]}>Calificación de TMDB</Text>
        </View>
      </View>
      <View style={s.wrap}>
        {obra.generos.map((g) => (
          <Text
            key={g}
            style={{
              color: c.muted,
              backgroundColor: c.panel,
              padding: espacio.s,
              borderRadius: radio.control,
              fontSize: tipografia.ayuda,
            }}
          >
            {g}
          </Text>
        ))}
      </View>
      {errorGuardar && <Aviso texto={errorGuardar} error />}
      {entrada ? (
        <Boton
          texto="En tu lista · Editar entrada"
          onPress={() => navigation.navigate('Editar', { itemId: entrada.id })}
        />
      ) : (
        <Boton
          texto="＋ Agregar a Mi lista"
          cargando={guardando}
          disabled={!conectado || operacionPendiente || cargandoLista}
          onPress={() => void guardar(obra)}
        />
      )}
      {!conectado && <Aviso texto="Conéctate a internet para agregar o editar una entrada." />}
      <Text style={s.subtitle}>La historia</Text>
      <Text style={[s.body, { color: c.text }]}>{obra.sinopsis}</Text>
      <Text style={s.subtitle}>Elenco principal</Text>
      {obra.elenco.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: espacio.l }}
        >
          {obra.elenco.map((actor) => (
            <View key={actor.id} style={{ width: medidas.poster.elenco, gap: espacio.s }}>
              <Poster
                path={actor.profile_path}
                titulo={actor.name}
                ancho={medidas.poster.elenco}
                perfil
              />
              <Text style={{ color: c.text, fontSize: tipografia.etiqueta, fontWeight: '600' }}>
                {actor.name}
              </Text>
              <Text style={{ color: c.muted, fontSize: tipografia.ayuda }}>
                {actor.character || 'Personaje no disponible'}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={s.body}>No hay información del elenco disponible.</Text>
      )}
    </ScrollView>
  );
}
