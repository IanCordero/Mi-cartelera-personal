import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, Text, TextInput, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootParams } from '../navigation/types';
import { EstadoPeticion, ResultadoBusqueda } from '../types';
import { buscar } from '../services/tmdbService';
import { useCartelera } from '../context/CarteleraContext';
import { Aviso, Boton, Cargando, Vacio } from '../components/UI';
import { TarjetaObra } from '../components/TarjetaObra';
import { c, s } from '../theme';
import { mensajeError } from '../utils/errors';
export function BuscarScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootParams>>();
  const { conectado } = useCartelera();
  const [titulo, setTitulo] = useState('');
  const [consulta, setConsulta] = useState('');
  const [estado, setEstado] = useState<EstadoPeticion<ResultadoBusqueda>>({ tipo: 'exito', datos: { resultados: [], pagina: 1, totalPaginas: 0, totalResultados: 0 } });
  const [mas, setMas] = useState(false);
  const [errorPagina, setErrorPagina] = useState<string | null>(null);
  const numero = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const lock = useRef(false);
  useEffect(() => () => { numero.current += 1; controller.current?.abort(); }, []);
  async function ejecutar(pagina = 1) {
    const query = pagina === 1 ? titulo.trim() : consulta;
    if (!query) return;
    if (pagina > 1 && lock.current) return;
    Keyboard.dismiss();
    controller.current?.abort(); controller.current = new AbortController();
    const signal = controller.current.signal;
    const n = ++numero.current;
    lock.current = true; setErrorPagina(null);
    if (pagina === 1) { setConsulta(query); setEstado({ tipo: 'cargando' }); setMas(false); }
    else setMas(true);
    try {
      const datos = await buscar(query, pagina, signal);
      if (numero.current !== n) return;
      setEstado(prev => {
        if (pagina === 1 || prev.tipo !== 'exito') return { tipo: 'exito', datos };
        const existentes = new Set(prev.datos.resultados.map(r => `${r.tipo}_${r.tmdbId}`));
        return { tipo: 'exito', datos: { ...datos, resultados: [...prev.datos.resultados,
          ...datos.resultados.filter(r => !existentes.has(`${r.tipo}_${r.tmdbId}`))] } };
      });
    } catch (e) {
      if (numero.current !== n) return;
      if (pagina === 1) setEstado({ tipo: 'error', mensaje: mensajeError(e) });
      else setErrorPagina(mensajeError(e));
    } finally { if (numero.current === n) { lock.current = false; setMas(false); } }
  }
  return <View style={s.screen}>
    <FlatList data={estado.tipo === 'exito' ? estado.datos.resultados : []} keyExtractor={item => `${item.tipo}_${item.tmdbId}`}
      contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListHeaderComponent={<View style={{ gap: 16, marginBottom: 20 }}>
        <Text style={s.eyebrow}>DESCUBRE ALGO PARA TI</Text><Text style={s.title}>Tu próxima obsesión.</Text>
        <Text style={s.body}>Películas y series para llenar tu cartelera.</Text>
        {!conectado && <Aviso texto="La búsqueda necesita internet. Puedes consultar tu última copia en Mi lista." />}
        <TextInput accessibilityLabel="Buscar películas y series" style={s.input} value={titulo} onChangeText={setTitulo}
          placeholder="Un título, mil historias…" placeholderTextColor={c.muted} returnKeyType="search" maxLength={150}
          onSubmitEditing={() => void ejecutar()} />
        <Boton texto="Buscar películas y series" disabled={!titulo.trim() || !conectado || estado.tipo === 'cargando'} onPress={() => void ejecutar()} />
        {consulta && estado.tipo === 'exito' && <Text style={s.label}>Resultados para «{consulta}»</Text>}
      </View>}
      renderItem={({ item }) => <TarjetaObra obra={item} onPress={() => nav.navigate('Detalle', { tipo: item.tipo, id: item.tmdbId })} />}
      ListEmptyComponent={estado.tipo === 'cargando' ? <Cargando texto="Buscando historias…" /> : estado.tipo === 'error' ?
        <View style={{ gap: 12 }}><Aviso texto={estado.mensaje} error /><Boton texto="Reintentar búsqueda" secundario onPress={() => void ejecutar()} /></View> :
        <Vacio titulo={consulta ? 'Sin títulos en esta página' : 'Todo empieza con un título'}
          texto={consulta ? 'Prueba otro nombre. TMDB también incluye personas; aquí solo mostramos películas y series.' : 'Busca esa película pendiente o la serie que todos te recomendaron.'} icono="search-outline" />}
      ListFooterComponent={estado.tipo === 'exito' && consulta && estado.datos.pagina < estado.datos.totalPaginas ?
        <View style={{ gap: 12, marginTop: 18 }}>{errorPagina && <Aviso texto={errorPagina} error />}
          <Boton texto="Cargar más resultados" secundario cargando={mas} disabled={!conectado} onPress={() => {
            if (estado.tipo === 'exito') void ejecutar(estado.datos.pagina + 1);
          }} /></View> : undefined} />
  </View>;
}
