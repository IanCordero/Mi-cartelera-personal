import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { observarRed } from '../services/redService';
import { CambiosEntrada, ItemLista, Obra, Usuario } from '../types';
import * as authService from '../services/authService';
import * as listaService from '../services/listaService';
import { guardarCache, leerCache } from '../services/cacheService';
import { problemaConfiguracion } from '../firebase/config';
import { conTiempoMaximo, mensajeError, TiempoAgotado } from '../utils/errors';
import { itemId } from '../utils/validation';

interface Cartelera {
  usuario: Usuario | null; iniciando: boolean; lista: ItemLista[]; cargandoLista: boolean;
  conectado: boolean; copiaLocal: boolean; ultimaCopia: string | null; aviso: string | null;
  problema: string | null; operacionPendiente: boolean;
  autenticar: typeof authService.entrar; cerrarSesion: () => Promise<void>;
  refrescar: () => Promise<void>; agregar: (obra: Obra) => Promise<void>;
  actualizar: (id: string, cambios: CambiosEntrada) => Promise<void>; eliminar: (id: string) => Promise<void>;
}
const Contexto = createContext<Cartelera | null>(null);
export function CarteleraProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [iniciando, setIniciando] = useState(() => !problemaConfiguracion());
  const [lista, setLista] = useState<ItemLista[]>([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [conectado, setConectado] = useState(true);
  const [copiaLocal, setCopiaLocal] = useState(false);
  const [ultimaCopia, setUltimaCopia] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [operacionPendiente, setOperacionPendiente] = useState(false);
  const [problema] = useState(problemaConfiguracion);
  const sesionRef = useRef(0);
  const uidRef = useRef<string | null>(null);
  const listaRef = useRef<ItemLista[]>([]);
  const onlineRef = useRef(true);
  const hidratado = useRef(false);
  const lecturaRef = useRef(0);
  const bloqueo = useRef<number | null>(null);

  const aplicar = useCallback((items: ItemLista[]) => { listaRef.current = items; setLista(items); }, []);
  const persistir = useCallback(async (uid: string, items: ItemLista[], sesion: number) => {
    try {
      const fecha = await guardarCache(uid, items);
      if (sesionRef.current === sesion) setUltimaCopia(fecha);
    } catch {
      if (sesionRef.current === sesion) setAviso('Los datos están en Firestore, pero no se pudo actualizar la copia del teléfono.');
    }
  }, []);
  const refrescar = useCallback(async () => {
    const uid = uidRef.current;
    if (!uid || !hidratado.current) return;
    if (!onlineRef.current) { setCopiaLocal(true); setAviso('Sin conexión. Mostramos la última copia guardada en este dispositivo.'); return; }
    const sesion = sesionRef.current;
    const lectura = ++lecturaRef.current;
    setCargandoLista(true);
    try {
      const items = await conTiempoMaximo(listaService.obtener(uid));
      if (sesionRef.current !== sesion || lecturaRef.current !== lectura) return;
      aplicar(items); setCopiaLocal(false); setAviso(null);
      await persistir(uid, items, sesion);
    } catch (error) {
      if (sesionRef.current === sesion && lecturaRef.current === lectura) {
        setCopiaLocal(true); setAviso(`${mensajeError(error)} Mostramos la última copia disponible.`);
      }
    } finally {
      if (sesionRef.current === sesion && lecturaRef.current === lectura) setCargandoLista(false);
    }
  }, [aplicar, persistir]);

  useEffect(() => {
    if (problema) return;
    return authService.observarSesion(u => {
      sesionRef.current += 1; lecturaRef.current += 1;
      uidRef.current = u?.uid ?? null; hidratado.current = false; bloqueo.current = null;
      aplicar([]); setAviso(null); setUltimaCopia(null); setCopiaLocal(false);
      setOperacionPendiente(false); setCargandoLista(!!u); setUsuario(u); setIniciando(false);
    });
  }, [aplicar, problema]);

  useEffect(() => {
    if (!usuario) return;
    const uid = usuario.uid;
    const sesion = sesionRef.current;
    let vigente = true;
    void (async () => {
      try {
        const copia = await leerCache(uid);
        if (!vigente || sesionRef.current !== sesion) return;
        if (copia) { aplicar(copia.items); setUltimaCopia(copia.guardadaEn); setCopiaLocal(true); }
      } catch {
        if (vigente && sesionRef.current === sesion) setAviso('No se pudo leer la copia guardada. Intentaremos consultar Firestore.');
      }
      if (!vigente || sesionRef.current !== sesion) return;
      hidratado.current = true; setCargandoLista(false);
      await refrescar();
    })();
    return () => { vigente = false; };
  }, [usuario, aplicar, refrescar]);

  useEffect(() => {
    const quitarRed = observarRed(online => {
      const recuperada = !onlineRef.current && online;
      onlineRef.current = online; setConectado(online);
      if (!online && uidRef.current) {
        lecturaRef.current += 1; setCargandoLista(false); setCopiaLocal(true);
        setAviso('Sin conexión. Mostramos la última copia guardada en este dispositivo.');
      }
      if (recuperada) void refrescar();
    });
    const sub = AppState.addEventListener('change', state => { if (state === 'active') void refrescar(); });
    return () => { quitarRed(); sub.remove(); };
  }, [refrescar]);

  const mutar = useCallback(async (accion: (uid: string) => Promise<void>, transformar: (items: ItemLista[]) => ItemLista[]) => {
    const uid = uidRef.current;
    const sesion = sesionRef.current;
    if (!uid) throw new Error('Inicia sesión para modificar tu lista.');
    if (!onlineRef.current) throw new Error('Conéctate a internet para guardar cambios. Tu lista sigue disponible para consulta.');
    if (!hidratado.current || cargandoLista) throw new Error('Espera a que termine de cargar tu lista.');
    if (bloqueo.current === sesion) throw new Error('Aún estamos confirmando la operación anterior. Actualiza la lista en unos segundos.');
    bloqueo.current = sesion; setOperacionPendiente(true);
    lecturaRef.current += 1;
    // Un timeout no cancela una transacción que ya llegó al servidor.
    // Se mantiene el bloqueo hasta que termine y se concilia la respuesta tardía.
    const operacion = accion(uid).then(async () => {
      if (sesionRef.current !== sesion) return;
      aplicar(transformar(listaRef.current)); setCopiaLocal(false); setAviso(null);
      await persistir(uid, listaRef.current, sesion);
    });
    void operacion.then(() => {
      if (sesionRef.current === sesion) void refrescar();
    }, () => {
      if (sesionRef.current === sesion) void refrescar();
    }).finally(() => {
      if (bloqueo.current === sesion) { bloqueo.current = null; setOperacionPendiente(false); }
    });
    try { await conTiempoMaximo(operacion); }
    catch (error) {
      if (sesionRef.current === sesion && error instanceof TiempoAgotado) {
        setAviso('La operación aún no está confirmada. Se comprobará al recibir respuesta. Las nuevas modificaciones están temporalmente bloqueadas.');
      }
      throw error;
    }
  }, [aplicar, cargandoLista, persistir, refrescar]);

  const agregar = useCallback((obra: Obra) => {
    const id = itemId(obra);
    if (listaRef.current.some(item => item.id === id)) return Promise.reject(new Error('Esta obra ya está en tu lista.'));
    return mutar(uid => listaService.agregar(uid, obra), items => {
      const fecha = new Date().toISOString();
      return [{ ...obra, titulo: [...obra.titulo].slice(0, 200).join(''), id, estado: 'por_ver',
        calificacionPersonal: null, comentario: '', agregadoEn: fecha, actualizadoEn: fecha }, ...items.filter(i => i.id !== id)];
    });
  }, [mutar]);
  const actualizar = useCallback((id: string, cambios: CambiosEntrada) => mutar(
    uid => listaService.actualizar(uid, id, cambios),
    items => items.map(item => item.id === id ? { ...item, ...cambios, actualizadoEn: new Date().toISOString() } : item),
  ), [mutar]);
  const eliminar = useCallback((id: string) => mutar(uid => listaService.eliminar(uid, id), items => items.filter(item => item.id !== id)), [mutar]);
  const cerrarSesion = useCallback(async () => { await authService.salir(); }, []);

  return <Contexto.Provider value={{ usuario, iniciando, lista, cargandoLista, conectado, copiaLocal, ultimaCopia,
    aviso, problema, operacionPendiente, autenticar: authService.entrar, cerrarSesion, refrescar, agregar, actualizar, eliminar }}>
    {children}
  </Contexto.Provider>;
}
export function useCartelera(): Cartelera {
  const context = useContext(Contexto);
  if (!context) throw new Error('Falta CarteleraProvider.');
  return context;
}
