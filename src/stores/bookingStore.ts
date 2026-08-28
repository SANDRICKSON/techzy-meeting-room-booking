import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Booking, BookingStatus } from '../domain/entities/Booking';
import { BookingRepository } from '../api/bookingRepository';
import { RoomRepository } from '../api/roomRepository';
import { BookingService } from '../domain/services/bookingService';

interface BookingFilters {
    search: string;
    status?: BookingStatus;
    dateRange?: { start: Date; end: Date };
    roomId?: string;
    employeeId?: string;
}

interface BookingState {
    bookings: Booking[];
    loading: boolean;
    error: string | null;
    filters: BookingFilters;
    selectedBooking: Booking | null;
    service: BookingService;

    fetchBookings: () => Promise<void>;
    createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Booking>;
    updateBooking: (id: string, data: Partial<Booking>) => Promise<Booking>;
    cancelBooking: (id: string) => Promise<void>;
    setFilters: (filters: Partial<BookingFilters>) => void;
    setSelectedBooking: (booking: Booking | null) => void;
    getFilteredBookings: () => Booking[];
    getBookingsForRoom: (roomId: string) => Booking[];
}

export const useBookingStore = create<BookingState>()(
    devtools((set, get) => {
        const bookingRepo = new BookingRepository();
        const roomRepo = new RoomRepository();
        const service = new BookingService(bookingRepo, roomRepo);

        return {
            bookings: [],
            loading: false,
            error: null,
            filters: { search: '' },
            selectedBooking: null,
            service,

            fetchBookings: async () => {
                set({ loading: true, error: null });
                try {
                    const bookings = await bookingRepo.findAll();
                    set({ bookings, loading: false });
                } catch (error) {
                    set({ error: (error as Error).message, loading: false });
                }
            },

            createBooking: async (bookingData) => {
                try {
                    const newBooking = await service.createBooking(bookingData);
                    set(state => ({
                        bookings: [...state.bookings, newBooking]
                    }));
                    return newBooking;
                } catch (error) {
                    set({ error: (error as Error).message });
                    throw error;
                }
            },

            updateBooking: async (id, data) => {
                try {
                    const updated = await service.updateBooking(id, data);
                    set(state => ({
                        bookings: state.bookings.map(b => b.id === id ? updated : b)
                    }));
                    return updated;
                } catch (error) {
                    set({ error: (error as Error).message });
                    throw error;
                }
            },

            cancelBooking: async (id) => {
                try {
                    await service.cancelBooking(id);
                    set(state => ({
                        bookings: state.bookings.map(b =>
                            b.id === id ? { ...b, status: BookingStatus.CANCELLED } : b
                        )
                    }));
                } catch (error) {
                    set({ error: (error as Error).message });
                    throw error;
                }
            },

            setFilters: (filters) => {
                set(state => ({
                    filters: { ...state.filters, ...filters }
                }));
            },

            setSelectedBooking: (booking) => {
                set({ selectedBooking: booking });
            },

            getFilteredBookings: () => {
                const { bookings, filters } = get();
                let result = [...bookings];

                if (filters.search) {
                    const search = filters.search.toLowerCase();
                    result = result.filter(b =>
                        b.title.toLowerCase().includes(search) ||
                        b.description?.toLowerCase().includes(search)
                    );
                }

                if (filters.status) {
                    result = result.filter(b => b.status === filters.status);
                }

                if (filters.roomId) {
                    result = result.filter(b => b.roomId === filters.roomId);
                }

                if (filters.employeeId) {
                    result = result.filter(b =>
                        b.employeeId === filters.employeeId ||
                        b.attendees.includes(filters.employeeId!)
                    );
                }

                if (filters.dateRange) {
                    const { start, end } = filters.dateRange;
                    result = result.filter(b => {
                        const date = new Date(b.startTime);
                        return date >= start && date <= end;
                    });
                }

                return result.sort((a, b) =>
                    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                );
            },

            getBookingsForRoom: (roomId) => {
                const { bookings } = get();
                return bookings
                    .filter(b => b.roomId === roomId && b.status !== BookingStatus.CANCELLED)
                    .sort((a, b) =>
                        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                    );
            }
        };
    })
);