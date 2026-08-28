import { BaseRepository } from './repository';
import { Booking, BookingStatus } from '../domain/entities/Booking';
import initialBookings from '../data/bookings.json';

export class BookingRepository extends BaseRepository<Booking> {
    constructor() {
        super('bookings', initialBookings as Booking[]);
    }

    async findByRoom(roomId: string): Promise<Booking[]> {
        const bookings = await this.findAll();
        return bookings.filter(b => b.roomId === roomId && b.status !== BookingStatus.CANCELLED);
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
        const bookings = await this.findAll();
        return bookings.filter(b => {
            const bStart = new Date(b.startTime);
            const bEnd = new Date(b.endTime);
            return (bStart >= startDate && bStart <= endDate) ||
                (bEnd >= startDate && bEnd <= endDate) ||
                (bStart <= startDate && bEnd >= endDate);
        });
    }

    async findByEmployee(employeeId: string): Promise<Booking[]> {
        const bookings = await this.findAll();
        return bookings.filter(b =>
            b.employeeId === employeeId || b.attendees.includes(employeeId)
        );
    }

    async findUpcoming(days = 7): Promise<Booking[]> {
        const bookings = await this.findAll();
        const now = new Date();
        const future = new Date(now);
        future.setDate(future.getDate() + days);

        return bookings.filter(b => {
            const start = new Date(b.startTime);
            return start >= now && start <= future && b.status !== BookingStatus.CANCELLED;
        });
    }
}