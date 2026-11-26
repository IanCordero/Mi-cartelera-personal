import React from 'react';
import { SvgXml } from 'react-native-svg';
// SVG oficial sin redibujar ni alterar; funciona también sin conexión.
import { xml } from '../tema/marcaTmdb';
import { medidas } from '../tema';
export function TmdbLogo() {
  return (
    <SvgXml
      xml={xml}
      width={medidas.logoTmdb.ancho}
      height={medidas.logoTmdb.alto}
      accessibilityLabel="Logo oficial de TMDB"
    />
  );
}
