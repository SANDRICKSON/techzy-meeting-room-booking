export interface Room {
    id: string;
    name: string;
    floor: number;
    building: string;
    capacity: number;
    equipment: string[];
    amenities: string[];
    image?: string;
    isActive: boolean;
}