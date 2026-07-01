'use client';

import { CustomModal } from '@/components/ui/CustomModal';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ConfirmarAsistenciaModalProps {
  isOpen: boolean;
  fecha: string;
  laboratorio: string;
  onClose: () => void;
  onConfirmar: (asistio: boolean) => void;
}

export function ConfirmarAsistenciaModal({
  isOpen, fecha, laboratorio, onClose, onConfirmar
}: ConfirmarAsistenciaModalProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      type="form"
      title="Confirmar asistencia"
      message={`¿Utilizaste el ${laboratorio} el día ${fecha}?`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3 mt-4">
        <p className="text-xs text-slate-400 font-medium text-center">
          Esta acción queda registrada en el sistema. Si no confirmas en 72 horas, el sistema lo marcará como no asistido automáticamente.
        </p>
        <div className="flex gap-3 mt-2">
          <Button
            type="button"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2"
            onClick={() => onConfirmar(true)}>
            <CheckCircle2 size={18} /> Sí, asistí
          </Button>
          <Button
            type="button"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2"
            onClick={() => onConfirmar(false)}>
            <XCircle size={18} /> No asistí
          </Button>
        </div>
        <Button type="button" variant="outline"
          className="rounded-xl font-bold text-slate-500"
          onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </CustomModal>
  );
}