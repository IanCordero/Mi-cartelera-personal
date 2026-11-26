import { describe, expect, it } from 'vitest';
import { validarCambios } from '../../src/utils/validation';

describe('Regla preservada de P3: solo se califica una obra Vista', () => {
  it.each([1, 5])('admite %i estrellas en Vista', (calificacionPersonal) => {
    expect(() =>
      validarCambios({ estado: 'vista', calificacionPersonal, comentario: '' }),
    ).not.toThrow();
  });
  it.each(['por_ver', 'viendo'] as const)('rechaza estrellas en %s', (estado) => {
    expect(() => validarCambios({ estado, calificacionPersonal: 3, comentario: '' })).toThrow();
  });
  it.each(['por_ver', 'viendo', 'vista'] as const)('admite calificación null en %s', (estado) => {
    expect(() =>
      validarCambios({ estado, calificacionPersonal: null, comentario: '' }),
    ).not.toThrow();
  });
  it.each([0, 6, 2.5])('rechaza la calificación fuera de contrato %s', (calificacionPersonal) => {
    expect(() =>
      validarCambios({ estado: 'vista', calificacionPersonal, comentario: '' }),
    ).toThrow();
  });
  it('acepta 500 caracteres y rechaza 501 sin alterar la regla original', () => {
    expect(() =>
      validarCambios({ estado: 'vista', calificacionPersonal: null, comentario: 'a'.repeat(500) }),
    ).not.toThrow();
    expect(() =>
      validarCambios({ estado: 'vista', calificacionPersonal: null, comentario: 'a'.repeat(501) }),
    ).toThrow();
  });
});
