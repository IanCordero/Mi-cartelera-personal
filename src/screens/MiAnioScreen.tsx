import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootParams } from '../navigation/types';
import { useCartelera } from '../context/CarteleraContext';
import {
  aniosDisponibles,
  formatearHoras,
  pendientesFecha,
  resumenAnual,
} from '../dominio/resumenAnual';
import type { ProgresoPreparacion } from '../services/preparacionService';
import { mensajeError } from '../utils/errors';
import { Aviso, Boton, Cargando, Vacio } from '../components/UI';
import {
  BarrasMes,
  ObraDestacada,
  Preferencia,
  SelectorAnio,
  TarjetaDato,
} from '../components/ResumenAnual';
import { s, espacio as e } from '../tema';

export function MiAnioScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootParams>>();
  const {
    lista,
    cargandoLista,
    conectado,
    copiaLocal,
    ultimaCopia,
    aviso,
    usuario,
    prepararAnio,
    refrescar,
  } = useCartelera();
  // El reloj y calendario son dependencias de presentación, nunca del dominio puro.
  const uid = usuario?.uid;
  const anioActual = new Date().getFullYear();
  const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [elegido, setElegido] = useState(anioActual);
  const anios = useMemo(() => aniosDisponibles(lista, anioActual, zona), [lista, anioActual, zona]);
  const anio = anios.includes(elegido) ? elegido : anioActual;
  const resumen = useMemo(() => resumenAnual(lista, anio, zona), [lista, anio, zona]);
  const fechasPendientes = pendientesFecha(lista);
  const [intento, setIntento] = useState(0);
  const [progreso, setProgreso] = useState<ProgresoPreparacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  // No depender de lista: cada confirmación de la preparación cambia su referencia.
  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      let vigente = true;
      setError(null);
      setProgreso(null);
      if (uid && intento >= 0 && !cargandoLista && conectado && !copiaLocal) {
        void prepararAnio(
          anio,
          zona,
          (p) => {
            if (vigente) setProgreso(p);
          },
          controller.signal,
        ).catch((err) => {
          if (vigente) {
            setError(mensajeError(err));
            setProgreso(null);
          }
        });
      }
      return () => {
        vigente = false;
        controller.abort();
      };
    }, [anio, zona, cargandoLista, conectado, copiaLocal, prepararAnio, intento, uid]),
  );
  const preparando = progreso?.fase === 'fechas' || progreso?.fase === 'metadatos';
  const irLista = () => nav.navigate('Inicio', { screen: 'MiLista' });
  const reintentar = async () => {
    if (copiaLocal) await refrescar();
    setIntento((n) => n + 1);
  };
  const sinCopia = copiaLocal && !ultimaCopia && lista.length === 0;
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.eyebrow}>CADA HISTORIA DEJA UNA HUELLA</Text>
      <Text style={s.title}>Mi año en cine.</Text>
      <Text style={s.body}>Las historias que hicieron tu {anio}.</Text>
      <SelectorAnio anios={anios} valor={anio} onChange={setElegido} />
      {(copiaLocal || !conectado) && (
        <Aviso
          texto={
            sinCopia
              ? 'No hay una copia guardada en este dispositivo. Conéctate y vuelve a intentarlo.'
              : `${!conectado ? 'Sin conexión. ' : ''}Mostramos la última copia guardada${ultimaCopia ? ` · ${new Date(ultimaCopia).toLocaleString('es-EC')}` : ''}.`
          }
        />
      )}
      {aviso && conectado && <Aviso texto={aviso} error={copiaLocal} />}
      {cargandoLista && <Cargando texto="Consultando tu cartelera…" />}
      {preparando && (
        <View accessibilityLiveRegion="polite">
          <Cargando
            texto={`${progreso.fase === 'fechas' ? 'Recuperando fechas' : 'Completando datos'} · ${progreso.completadas} de ${progreso.total}`}
          />
        </View>
      )}
      {error && <Aviso texto={`No pudimos actualizar tu resumen. ${error}`} error />}
      {fechasPendientes > 0 && (
        <Aviso
          texto={`${fechasPendientes} obras vistas tienen su fecha pendiente de recuperar. Se incluirán en su año al completar la recuperación con conexión.`}
        />
      )}
      {resumen.obrasSinDatos > 0 && (
        <Aviso
          texto={`${resumen.obrasSinDatos} obras con datos pendientes. Siguen contando en el total; sus horas, géneros y directores se completarán cuando estén disponibles.`}
        />
      )}
      {(error || copiaLocal || fechasPendientes > 0 || resumen.obrasSinDatos > 0) && (
        <Boton
          texto="Reintentar resumen"
          secundario
          disabled={!conectado || cargandoLista || preparando}
          onPress={() => void reintentar()}
        />
      )}
      {!cargandoLista && !preparando && !sinCopia && resumen.totalObras === 0 ? (
        <>
          <Vacio
            titulo="Tu año todavía tiene historias por descubrir"
            texto={`Marca una película o serie como Vista para empezar tu resumen de ${anio}.`}
            icono="calendar-outline"
          />
          <Boton texto="Ir a Mi lista" onPress={irLista} />
        </>
      ) : resumen.totalObras > 0 ? (
        <>
          <TarjetaDato
            etiqueta="HISTORIAS QUE VISTE"
            cifra={String(resumen.totalObras)}
            contexto={`${resumen.peliculas} ${resumen.peliculas === 1 ? 'película' : 'películas'} · ${resumen.series} ${resumen.series === 1 ? 'serie' : 'series'}`}
            protagonista
          />
          <TarjetaDato
            etiqueta="TIEMPO ENTRE HISTORIAS"
            cifra={formatearHoras(resumen.horas)}
            contexto="Solo películas · Las series no suman horas"
          />
          {resumen.peliculasSinDuracion > 0 && (
            <Text style={s.body}>
              {resumen.peliculasSinDuracion} películas sin duración disponible. Este grupo puede
              coincidir con las obras con datos pendientes.
            </Text>
          )}
          <Preferencia
            etiqueta="TU GÉNERO"
            dato={resumen.generoTop}
            sinDatos="No hay géneros disponibles para las obras de este año."
          />
          <Preferencia
            etiqueta="DETRÁS DE LA CÁMARA"
            dato={resumen.directorTop}
            sinDatos="No hay directores disponibles. Solo se consideran películas."
          />
          <BarrasMes cantidades={resumen.obrasPorMes} mesTop={resumen.mesTop} />
          <ObraDestacada
            obra={resumen.destacada}
            onEditar={(id) => nav.navigate('Editar', { itemId: id })}
            onLista={irLista}
          />
          <View style={{ paddingBottom: e.s }}>
            <Text style={s.body}>
              Cada obra cuenta una vez. Las fechas usan el calendario de tu dispositivo.
            </Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
