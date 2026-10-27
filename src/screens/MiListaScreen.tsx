import React, { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParams } from '../navigation/types';
import { useCartelera } from '../context/CarteleraContext';
import { EstadoVisto, ETIQUETA_ESTADO, TipoMedio } from '../types';
import { Aviso, Boton, Cargando, Chip, Vacio } from '../components/UI';
import { TarjetaObra } from '../components/TarjetaObra';
import { c, s } from '../theme';
export function MiListaScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootParams>>();
  const { lista, cargandoLista, refrescar, aviso, copiaLocal, ultimaCopia, conectado, operacionPendiente } = useCartelera();
  const [estado, setEstado] = useState<EstadoVisto | 'todos'>('todos');
  const [tipo, setTipo] = useState<TipoMedio | 'todos'>('todos');
  const filtrada = useMemo(() => lista.filter(item => (estado === 'todos' || item.estado === estado) && (tipo === 'todos' || item.tipo === tipo)), [lista, estado, tipo]);
  const estados: (EstadoVisto | 'todos')[] = ['todos', 'por_ver', 'viendo', 'vista'];
  const tipos: { key: TipoMedio | 'todos'; label: string }[] = [{ key: 'todos', label: 'Todo' }, { key: 'movie', label: 'Películas' }, { key: 'tv', label: 'Series' }];
  return <View style={s.screen}><FlatList data={filtrada} keyExtractor={item => item.id} contentContainerStyle={s.content}
    refreshing={cargandoLista} onRefresh={() => void refrescar()} ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    ListHeaderComponent={<View style={{ gap: 17, marginBottom: 20 }}>
      <Text style={s.eyebrow}>TU COLECCIÓN, TUS REGLAS</Text><Text style={s.title}>Mi lista.</Text>
      <View style={s.panel}><View style={s.row}>
        <Text style={{ color: c.accent, fontWeight: '800', fontSize: 38 }}>{lista.length}</Text>
        <View style={{ flex: 1 }}><Text style={s.label}>historias guardadas</Text><Text style={s.body}>{lista.filter(i => i.estado === 'vista').length} vistas · {lista.filter(i => i.estado === 'por_ver').length} por descubrir</Text></View>
      </View></View>
      {aviso && <Aviso texto={aviso} />}
      {copiaLocal && <Text style={[s.body, { fontSize: 12 }]}>Copia local{ultimaCopia ? ` · ${new Date(ultimaCopia).toLocaleString('es-EC')}` : ' · Aún no hay una copia guardada'}.</Text>}
      {operacionPendiente && <Aviso texto="Confirmando una modificación con el servidor…" />}
      <Text style={s.label}>Estado</Text>
      <View style={s.wrap}>{estados.map(e => <Chip key={e} texto={e === 'todos' ? 'Todas' : ETIQUETA_ESTADO[e]} activo={estado === e} onPress={() => setEstado(e)} />)}</View>
      <View style={s.wrap}>{tipos.map(t => <Chip key={t.key} texto={t.label} activo={tipo === t.key} onPress={() => setTipo(t.key)} />)}</View>
      <Boton texto="Actualizar lista" secundario cargando={cargandoLista} disabled={!conectado} onPress={() => void refrescar()} />
    </View>}
    renderItem={({ item }) => <TarjetaObra obra={item} entrada={item} onPress={() => nav.navigate('Editar', { itemId: item.id })} />}
    ListEmptyComponent={cargandoLista ? <Cargando texto="Cargando tu cartelera…" /> : <Vacio titulo={lista.length ? 'No hay coincidencias' : 'Tu cartelera está por empezar'}
      texto={lista.length ? 'Cambia los filtros para ver otros títulos de tu colección.' : copiaLocal ? 'No hay títulos en la copia disponible. Conéctate y actualiza la lista.' : 'Ve a Buscar y guarda tu primera película o serie.'} icono="bookmarks-outline" />} />
  </View>;
}
