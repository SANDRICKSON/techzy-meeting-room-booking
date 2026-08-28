import { Room } from '../entities/Room';
import { RoomRepository } from '../../api/roomRepository';

export interface RoomFilters {
    building?: string;
    minCapacity?: number;
    maxCapacity?: number;
    equipment?: string[];
    search?: string;
    floor?: number;
}

export class RoomService {
    constructor(private roomRepo: RoomRepository) {}

    async getAvailableRooms(): Promise<Room[]> {
        return this.roomRepo.findActive();
    }

    async filterRooms(filters: RoomFilters): Promise<Room[]> {
        let rooms = await this.getAvailableRooms();

        if (filters.building) {
            rooms = rooms.filter(r => r.building === filters.building);
        }

        if (filters.floor !== undefined) {
            rooms = rooms.filter(r => r.floor === filters.floor);
        }

        if (filters.minCapacity) {
            rooms = rooms.filter(r => r.capacity >= filters.minCapacity!);
        }

        if (filters.maxCapacity) {
            rooms = rooms.filter(r => r.capacity <= filters.maxCapacity!);
        }

        if (filters.equipment && filters.equipment.length > 0) {
            rooms = rooms.filter(r =>
                filters.equipment!.every(eq =>
                    r.equipment.some(e => e.toLowerCase() === eq.toLowerCase())
                )
            );
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            rooms = rooms.filter(r =>
                r.name.toLowerCase().includes(search) ||
                r.building.toLowerCase().includes(search) ||
                r.equipment.some(e => e.toLowerCase().includes(search))
            );
        }

        return rooms;
    }

    async getUniqueBuildings(): Promise<string[]> {
        const rooms = await this.getAvailableRooms();
        return [...new Set(rooms.map(r => r.building))];
    }

    async getUniqueEquipment(): Promise<string[]> {
        const rooms = await this.getAvailableRooms();
        const equipment = rooms.flatMap(r => r.equipment);
        return [...new Set(equipment)];
    }
}