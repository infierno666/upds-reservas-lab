'use client';

import { useState } from 'react';
import { CustomModal } from '@/components/ui/CustomModal';
import { Button } from '@/components/ui/button';

interface BloqueoModalProps {
  isOpen: boolean;
  nombreLaboratorio: string;
  onClose: () => void;
  onConfirm: (fechas: string[], motivo: string) => void;
}

export function BloqueoModal({ isOpen, nombreLaboratorio, onClose, onConfirm }: BloqueoModalProps) {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  // Genera un array de fechas entre dos rangos inclusive
  const generarRangoFechas = (desde: string, hasta: string): string[] => {
    const fechas: string[] = [];
    const actual = new Date(desde);
    const fin = new Date(hasta);
    while (actual <= fin) {
      fechas.push(actual.toISOString().split('T')[0]);
      actual.setDate(actual.getDate() + 1);
    }
    return fechas;
  };

  const handleConfirm = () => {
    const nuevosErrores: { [key: string]: string } = {};
    if (!fechaDesde) nuevosErrores.fechaDesde = 'La fecha de inicio es obligatoria.';
    if (!fechaHasta) nuevosErrores.fechaHasta = 'La fecha de fin es obligatoria.';
    if (fechaDesde && fechaHasta && fechaHasta < fechaDesde)
      nuevosErrores.fechaHasta = 'La fecha de fin no puede ser anterior al inicio.';
    if (motivo.trim().length === 0) nuevosErrores.motivo = 'El motivo es obligatorio.';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const fechas = generarRangoFechas(fechaDesde, fechaHasta);
    onConfirm(fechas, motivo.trim());
    setFechaDesde('');
    setFechaHasta('');
    setMotivo('');
    setErrores({});
  };

  const handleClose = () => {
    setFechaDesde('');
    setFechaHasta('');
    setMotivo('');
    setErrores({});
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      type="form"
      title={`Bloquear "${nombreLaboratorio}"`}
      message="Define el rango de fechas y el motivo del bloqueo. Las reservas activas en esas fechas serán canceladas automáticamente."
      onClose={handleClose}
    >
      <div className="flex flex-col gap-3 mt-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Fecha inicio</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-200 outline-none"
            />
            {errores.fechaDesde && <p className="text-red-500 text-xs mt-1">{errores.fechaDesde}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Fecha fin</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              min={fechaDesde || new Date().toISOString().split('T')[0]}
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-200 outline-none"
            />
            {errores.fechaHasta && <p className="text-red-500 text-xs mt-1">{errores.fechaHasta}</p>}
          </div>
        </div>

        {/* Preview del rango seleccionado */}
        {fechaDesde && fechaHasta && fechaHasta >= fechaDesde && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            Se bloquearán <strong>{generarRangoFechas(fechaDesde, fechaHasta).length} días</strong> entre {fechaDesde} y {fechaHasta}.
          </p>
        )}

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Motivo del bloqueo</label>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ej: Mantenimiento de equipos, evento institucional..."
            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-200 outline-none"
            rows={3}
          />
          {errores.motivo && <p className="text-red-500 text-xs mt-1">{errores.motivo}</p>}
        </div>

        <div className="flex gap-2 justify-end mt-1">
          <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button type="button" className="bg-slate-900 hover:bg-slate-800" onClick={handleConfirm}>
            Confirmar bloqueo
          </Button>
        </div>
      </div>
    </CustomModal>
  );
}