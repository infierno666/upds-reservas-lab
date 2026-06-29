'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Laboratorio, LaboratorioFormData } from '@/types/laboratory';
import { existeNombreLaboratorio } from '@/lib/services/laboratorio.service';

interface LaboratorioFormProps {
  laboratorio?: Laboratorio | null;
  onSubmit: (form: LaboratorioFormData) => void;
  onCancel: () => void;
}

export function LaboratorioForm({ laboratorio, onSubmit, onCancel }: LaboratorioFormProps) {
  const [nombre, setNombre] = useState(laboratorio?.nombre ?? '');
  const [capacidad, setCapacidad] = useState(laboratorio?.capacidad?.toString() ?? '');
  const [caracteristicas, setCaracteristicas] = useState(laboratorio?.caracteristicas ?? '');
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [validando, setValidando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevosErrores: { [key: string]: string } = {};

    // Validaciones obligatorias en el frontend
    if (nombre.trim().length === 0) nuevosErrores.nombre = 'El nombre es obligatorio.';
    if (capacidad.trim().length === 0) nuevosErrores.capacidad = 'La capacidad es obligatoria.';
    else if (isNaN(Number(capacidad)) || Number(capacidad) <= 0) nuevosErrores.capacidad = 'La capacidad debe ser un numero mayor a 0.';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // Validacion de nombre duplicado (solo si cambio o es nuevo)
    if (!laboratorio || laboratorio.nombre !== nombre.trim()) {
      setValidando(true);
      const existe = await existeNombreLaboratorio(nombre);
      setValidando(false);
      if (existe) {
        setErrores({ nombre: 'Ya existe un laboratorio con ese nombre.' });
        return;
      }
    }

    setErrores({});
    onSubmit({ nombre: nombre.trim(), capacidad: Number(capacidad), caracteristicas });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="text-sm font-medium">Nombre</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border rounded p-2 text-sm" />
        {errores.nombre && <p className="text-red-600 text-xs">{errores.nombre}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Capacidad</label>
        <input value={capacidad} onChange={(e) => setCapacidad(e.target.value)} type="number" className="w-full border rounded p-2 text-sm" />
        {errores.capacidad && <p className="text-red-600 text-xs">{errores.capacidad}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Caracteristicas</label>
        <textarea value={caracteristicas} onChange={(e) => setCaracteristicas(e.target.value)} className="w-full border rounded p-2 text-sm" rows={3} />
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={validando}>{validando ? 'Validando...' : 'Guardar'}</Button>
      </div>
    </form>
  );
}