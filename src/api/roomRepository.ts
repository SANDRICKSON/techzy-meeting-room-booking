import { BaseRepository } from './repository';
import { Room } from '../domain/entities/Room';
import initialRooms from '../data/rooms.json';

export class RoomRepository extends BaseRepository<Room> {
    constructor() {
        super('rooms', initialRooms as Room[]);
    }

    async findByBuilding(building: string): Promise<Room[]> {
        const rooms = await this.findAll();
        return rooms.filter(r => r.building === building && r.isActive);
    }

    async findByCapacity(minCapacity: number): Promise<Room[]> {
        const rooms = await this.findAll();
        return rooms.filter(r => r.capacity >= minCapacity && r.isActive);
    }

    async findActive(): Promise<Room[]> {
        const rooms = await this.findAll();
        return rooms.filter(r => r.isActive);
    }
}