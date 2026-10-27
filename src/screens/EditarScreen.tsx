import React, { useState } from 'react';
import { Modal, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../navigation/types';
import { useCartelera } from '../context/CarteleraContext';
import { EstadoVisto } from '../types';
import { Aviso, Boton, Vacio } from '../components/UI';
import { Poster } from '../components/Poster';
import { SelectorEstado } from '../components/SelectorEstado';
import { Estrellas } from '../components/Estrellas';
import { c, s } from '../theme';
import { mensajeError } from '../utils/errors';
import { validarCambios } from '../utils/validation';
export function EditarScreen({ route, navigation }: NativeStackScreenProps<RootParams, 'Editar'>) {
  const { lista, actualizar, eliminar, conectado, operacionPendiente, cargandoLista } = useCartelera();
  const item = lista.find(i => i.id === route.params.itemId);
  const [estado, setEstado] = useState<EstadoVisto>(item?.estado ?? 'por_ver');
  const [estrellas, setEstrellas] = useState<number | null>(item?.calificacionPersonal ?? null);
  const [comentario, setComentario] = useState(item?.comentario ?? '');
  const [ocupado, setOcupado] = useState<'guardar' | 'borrar' | null>(null);
  const [confirmacion, setConfirmacion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const disabled = !conectado || operacionPendiente || cargandoLista || ocupado !== null;
  async function guardar() {
    if (!item || disabled) return;
    const cambios = { estado, calificacionPersonal: estado === 'vista' ? estrellas : null, comentario };
    setError(null);
    try {
      validarCambios(cambios); setOcupado('guardar');
      await actualizar(item.id, cambios); navigation.goBack();
    } catch (e) { setError(mensajeError(e)); }
    finally { setOcupado(null); }
  }
  async function borrar() {
    if (!item) return;
    setOcupado('borrar'); setError(null);
    try { await eliminar(item.id); navigation.goBack(); }
    catch (e) { setError(mensajeError(e)); }
    finally { setOcupado(null); }
  }
  function confirmar() {
    if (!item || disabled) return;
    setConfirmacion(true);
  }
  if (!item) return <View style={s.screen}><Vacio titulo="Esta entrada ya no está" texto="Vuelve a tu lista para consultar los títulos disponibles." /><Boton texto="Volver" onPress={() => navigation.goBack()} /></View>;
  return <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
      <View style={s.row}><Poster path={item.posterPath} titulo={item.titulo} ancho={70} /><View style={{ flex: 1, gap: 8 }}>
        <Text style={s.eyebrow}>TU OPINIÓN CUENTA</Text><Text style={s.subtitle}>{item.titulo}</Text><Text style={s.body}>{item.anio || 'Sin año'} · {item.tipo === 'movie' ? 'Película' : 'Serie'}</Text>
      </View></View>
      {!conectado && <Aviso texto="Estás sin conexión. Puedes consultar esta entrada; para guardar cambios necesitas internet." />}
      <View style={s.panel}><Text style={s.label}>¿En qué capítulo vas?</Text><SelectorEstado valor={estado} onChange={e => { setEstado(e); if (e !== 'vista') setEstrellas(null); }} /></View>
      <View style={s.panel}><Text style={s.label}>Tu calificación</Text><Text style={s.body}>{estado === 'vista' ? '¿Qué te pareció? Puedes dejarla sin calificar.' : 'Marca la obra como Vista para darle estrellas.'}</Text>
        <Estrellas valor={estrellas} disabled={estado !== 'vista' || disabled} onChange={setEstrellas} />
      </View>
      <View><Text style={s.label}>Tu comentario</Text><TextInput accessibilityLabel="Comentario personal" style={[s.input, { minHeight: 150, textAlignVertical: 'top' }]}
        multiline value={comentario} onChangeText={v => setComentario([...v].slice(0, 500).join(''))} editable={!disabled}
        placeholder="Una escena, una emoción, algo para recordar…" placeholderTextColor={c.muted} />
        <Text style={[s.body, { textAlign: 'right', fontSize: 12, marginTop: 8 }]}>{[...comentario].length}/500</Text></View>
      {error && <Aviso texto={error} error />}
      <Boton texto="Guardar cambios" disabled={disabled} cargando={ocupado === 'guardar'} onPress={() => void guardar()} />
      <Boton texto="Ver ficha en TMDB" secundario disabled={ocupado !== null} onPress={() => navigation.navigate('Detalle', { tipo: item.tipo, id: item.tmdbId })} />
      <Boton texto="Quitar de Mi lista" peligro disabled={disabled} cargando={ocupado === 'borrar'} onPress={confirmar} />
    </ScrollView>
    <Modal visible={confirmacion} transparent animationType="fade" onRequestClose={() => setConfirmacion(false)}>
      <View style={{ flex: 1, backgroundColor: '#000000BB', justifyContent: 'center', padding: 24 }}>
        <View accessibilityViewIsModal style={s.panel}>
          <Text style={s.subtitle}>¿Quitar de Mi lista?</Text>
          <Text style={s.body}>Se eliminarán tu calificación y comentario de «{item.titulo}».</Text>
          <Boton texto="Cancelar" secundario onPress={() => setConfirmacion(false)} />
          <Boton texto="Sí, quitar de Mi lista" peligro disabled={disabled} onPress={() => { setConfirmacion(false); void borrar(); }} />
        </View>
      </View>
    </Modal>
  </KeyboardAvoidingView>;
}
