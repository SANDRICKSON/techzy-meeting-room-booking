import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {Room} from '../domain/entities/Room';
import {RoomRepository} from '../api/roomRepository';
import {RoomService, RoomFilters} from '../domain/services/roomService';

interface RoomState {
    rooms: Room[];
    loading: boolean;
    error: string | null;
    filters: RoomFilters;
    service: RoomService;
    buildings: string[];
    equipment: string[];

    fetchRooms: () => Promise<void>;
    setFilters: (filters: Partial<RoomFilters>) => void;
    getFilteredRooms: () => Room[];
    getRoom: (id: string) => Room | undefined;
    loadMetadata: () => Promise<void>;
}

export const useRoomStore = create<RoomState>()(
    devtools((set, get) => {
        const repository = new RoomRepository();
        const service = new RoomService(repository);

        return {
            rooms: [],
            loading: false,
            error: null,
            filters: {},
            service,
            buildings: [],
            equipment: [],

            fetchRooms: async () => {
                set({loading: true, error: null});
                try {
                    const rooms = await repository.findAll();
                    set({rooms, loading: false});
                } catch (error) {
                    set({error: (error as Error).message, loading: false});
                }
            },

            setFilters: (filters) => {
                set(state => ({
                    filters: {...state.filters, ...filters}
                }));
            },

            getFilteredRooms: () => {
                const {rooms, filters} = get();
                const filtered = rooms.filter(room => {
                    if (filters.building && room.building !== filters.building) return false;
                    if (filters.floor !== undefined && room.floor !== filters.floor) return false;
                    if (filters.minCapacity && room.capacity < filters.minCapacity) return false;
                    if (filters.maxCapacity && room.capacity > filters.maxCapacity) return false;
                    if (filters.equipment?.length) {
                        if (!filters.equipment.every(eq =>
                            room.equipment.some(e => e.toLowerCase() === eq.toLowerCase())
                        )) return false;
                    }
                    if (filters.search) {
                        const search = filters.search.toLowerCase();
                        if (!room.name.toLowerCase().includes(search) &&
                            !room.building.toLowerCase().includes(search)) return false;
                    }
                    return room.isActive;
                });
                return filtered;
            },

            getRoom: (id) => {
                return get().rooms.find(r => r.id === id);
            },

            loadMetadata: async () => {
                await get().fetchRooms();
                const allRooms = get().rooms;
                const buildings = [...new Set(allRooms.map(r => r.building))];
                const equipment = [...new Set(allRooms.flatMap(r => r.equipment))];
                set({buildings, equipment});
            }
        };
    })
);