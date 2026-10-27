import { NavigatorScreenParams } from '@react-navigation/native';
import { TipoMedio } from '../types';
export type TabParams = { Buscar: undefined; MiLista: undefined; Acerca: undefined };
export type RootParams = {
  Inicio: NavigatorScreenParams<TabParams> | undefined;
  Detalle: { tipo: TipoMedio; id: number };
  Editar: { itemId: string };
};
