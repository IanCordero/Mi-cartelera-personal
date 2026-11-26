import { colores, espacio, tipografia, radio, medidas, lineas, c, s } from '../tema';

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCartelera } from '../context/CarteleraContext';
import { Aviso, Boton } from '../components/UI';

import { mensajeError } from '../utils/errors';
export function LoginScreen() {
  const { autenticar, problema } = useCartelera();
  const [registro, setRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [repetida, setRepetida] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  async function enviar() {
    if (enviando) return;
    if (registro && clave !== repetida) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await autenticar(email, clave, registro);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  }
  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          s.content,
          { flexGrow: 1, justifyContent: 'center', paddingTop: espacio.extra },
        ]}
      >
        <LinearGradient
          colors={[colores.acentoSuave, colores.superficie]}
          style={{ padding: espacio.xxl, borderRadius: radio.destacada, gap: espacio.l }}
        >
          <View style={s.row}>
            <Ionicons name="film-outline" size={medidas.iconoGrande} color={c.accent} />
            <Text style={s.eyebrow}>TU PRÓXIMA HISTORIA</Text>
          </View>
          <Text style={[s.title, { fontSize: tipografia.dato, lineHeight: lineas.dato }]}>
            Mi Cartelera{'\n'}Personal.
          </Text>
          <Text style={s.body}>Las historias que quieres ver.{'\n'}Las que se quedan contigo.</Text>
        </LinearGradient>
        <View style={{ gap: espacio.xl, marginTop: espacio.s }}>
          <Text style={s.subtitle}>{registro ? 'Crea tu cuenta' : 'Qué bueno verte de nuevo'}</Text>
          <Text style={s.body}>
            {registro
              ? 'Tu lista es privada y siempre va contigo.'
              : 'Inicia sesión y continúa tu historia.'}
          </Text>
          {problema && <Aviso texto={`${problema} Consulta docs/GUIA_PASO_A_PASO.md.`} error />}
          <View>
            <Text style={s.label}>Correo electrónico</Text>
            <TextInput
              accessibilityLabel="Correo electrónico"
              style={s.input}
              placeholder="tu@correo.com"
              placeholderTextColor={c.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!enviando}
            />
          </View>
          <View>
            <Text style={s.label}>Contraseña</Text>
            <View style={s.row}>
              <TextInput
                accessibilityLabel="Contraseña"
                style={[s.input, { flex: 1 }]}
                placeholder={registro ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                placeholderTextColor={c.muted}
                value={clave}
                onChangeText={setClave}
                secureTextEntry={!visible}
                autoCapitalize="none"
                autoComplete={registro ? 'new-password' : 'current-password'}
                editable={!enviando}
                onSubmitEditing={() => {
                  if (!registro) void enviar();
                }}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onPress={() => setVisible(!visible)}
                style={{
                  width: medidas.boton,
                  height: medidas.boton,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={visible ? 'eye-off-outline' : 'eye-outline'}
                  color={c.muted}
                  size={medidas.icono}
                />
              </Pressable>
            </View>
          </View>
          {registro && (
            <View>
              <Text style={s.label}>Confirma tu contraseña</Text>
              <TextInput
                accessibilityLabel="Confirma tu contraseña"
                style={s.input}
                value={repetida}
                onChangeText={setRepetida}
                secureTextEntry={!visible}
                autoCapitalize="none"
                placeholder="Repite tu contraseña"
                placeholderTextColor={c.muted}
                editable={!enviando}
                onSubmitEditing={() => void enviar()}
              />
            </View>
          )}
          {error && <Aviso texto={error} error />}
          <Boton
            texto={registro ? 'Crear mi cuenta' : 'Entrar a mi cartelera'}
            cargando={enviando}
            disabled={!!problema}
            onPress={() => void enviar()}
          />
          <Boton
            secundario
            texto={registro ? 'Ya tengo cuenta · Iniciar sesión' : 'Soy nuevo · Crear una cuenta'}
            disabled={enviando}
            onPress={() => {
              setRegistro(!registro);
              setError(null);
              setRepetida('');
            }}
          />
        </View>
        <Text style={[s.body, { textAlign: 'center', fontSize: tipografia.ayuda }]}>
          Un espacio para tu amor por el cine y las series.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
