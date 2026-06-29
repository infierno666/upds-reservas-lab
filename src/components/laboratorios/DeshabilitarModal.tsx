'use client';

import { useState } from 'react';
import { CustomModal } from '@/components/ui/CustomModal';
import { Button } from '@/components/ui/button';

interface DeshabilitarModalProps {
  isOpen: boolean;
  nombreLaboratorio: string;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}

export function DeshabilitarModal({ isOpen, nombreLaboratorio, onClose, onConfirm }: DeshabilitarModalProps) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    // Validacion: el motivo es obligatorio. Si falla, NO se cierra el modal.
    if (motivo.trim().length === 0) {
      setError('Debes escribir un motivo.');
      return;
    }
    onConfirm(motivo.trim());
    setMotivo('');
    setError('');
  };

  const handleClose = () => {
    setMotivo('');
    setError('');
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      type="form"
      title="Deshabilitar laboratorio"
      message={`Vas a deshabilitar "${nombreLaboratorio}". Las reservas pendientes o aprobadas de este laboratorio seran canceladas automaticamente.`}
      onClose={handleClose}
    >
      <textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Motivo de la deshabilitacion (obligatorio)"
        className="w-full border rounded p-2 text-sm"
        rows={3}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      <div className="flex gap-2 justify-end mt-3">
        <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
        <Button type="button" onClick={handleConfirm}>Confirmar</Button>
      </div>
    </CustomModal>
  );
}