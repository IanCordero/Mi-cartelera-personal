import { describe, expect, it } from 'vitest';
import { antigua, obra } from '../../tests/fixtures/cartelera';
import { fechaParaMigrar, planificarTransicion } from './visionado';

describe('Fecha de visionado · D1 y D2', () => {
  it.each(['por_ver', 'viendo'] as const)(
    'D1: de %s a Vista solicita timestamp del servidor',
    (estado) => {
      const plan = planificarTransicion(obra(1, { estado, vistaEn: null }), {
        estado: 'vista',
        calificacionPersonal: 4,
        comentario: 'Nueva opinión',
      });
      expect(plan.fecha).toBe('servidor');
      expect(plan.cambios.calificacionPersonal).toBe(4);
    },
  );
  it('D1: editar nota/comentario en Vista conserva la fecha', () => {
    expect(
      planificarTransicion(obra(1), {
        estado: 'vista',
        calificacionPersonal: 5,
        comentario: 'Cambio',
      }).fecha,
    ).toBe('conservar');
  });
  it.each(['por_ver', 'viendo'] as const)(
    'D1: salir de Vista hacia %s borra la fecha',
    (estado) => {
      const plan = planificarTransicion(obra(1), {
        estado,
        calificacionPersonal: null,
        comentario: '',
      });
      expect(plan.fecha).toBe('borrar');
      expect(plan.cambios.calificacionPersonal).toBeNull();
    },
  );
  it('D1: volver a Vista solicita una fecha nueva, no reutiliza una anterior', () => {
    const fuera = obra(1, { estado: 'viendo', vistaEn: null });
    expect(
      planificarTransicion(fuera, { estado: 'vista', calificacionPersonal: null, comentario: '' })
        .fecha,
    ).toBe('servidor');
  });
  it('Regla P3: rechaza una calificación fuera de Vista', () => {
    expect(() =>
      planificarTransicion(obra(1), { estado: 'viendo', calificacionPersonal: 3, comentario: '' }),
    ).toThrow();
  });
  it('D2: una Vista antigua usa el actualizadoEn recibido, sin reloj del sistema', () => {
    const anterior = antigua(1, { actualizadoEn: '2021-07-04T12:30:00.000Z' });
    expect(fechaParaMigrar(anterior)).toBe('2021-07-04T12:30:00.000Z');
  });
  it('D2: fecha ya migrada no se vuelve a tocar, aunque cambie actualizadoEn', () => {
    expect(fechaParaMigrar(obra(1))).toBeNull();
  });
  it('D2/D13: no inventa fechas para otros estados o actualizadoEn inválido', () => {
    expect(fechaParaMigrar(antigua(1, { estado: 'viendo' }))).toBeNull();
    expect(fechaParaMigrar(antigua(2, { actualizadoEn: 'inválida' }))).toBeNull();
  });
});
