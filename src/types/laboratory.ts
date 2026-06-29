// types/laboratory.ts
export type LabStatus = 'Operativo' | 'Mantenimiento';

export interface Laboratory {
    id: string;
    name: string;
    status: LabStatus;
    location: string;
    equipmentCount: number;
    occupied: number;
    capacity: number;
    tags: string[];
    isLocked: boolean;
}