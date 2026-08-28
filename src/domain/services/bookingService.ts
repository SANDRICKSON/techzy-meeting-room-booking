import { BookingRepository } from '../../api/bookingRepository';
import { Booking, BookingStatus } from '../entities/Booking';
import { RoomRepository } from '../../api/roomRepository';

export class BookingService {
    constructor(
        private bookingRepo: BookingRepository,
        private roomRepo: RoomRepository
    ) {}

    async checkAvailability(
        roomId: string,
        startTime: Date,
        endTime: Date,
        excludeBookingId?: string
    ): Promise<{ available: boolean; conflicts?: Booking[] }> {
        const bookings = await this.bookingRepo.findByRoom(roomId);

        const conflicts = bookings.filter(booking => {
            if (excludeBookingId && booking.id === excludeBookingId) return false;
            if (booking.status === BookingStatus.CANCELLED) return false;

            const bStart = new Date(booking.startTime);
            const bEnd = new Date(booking.endTime);

            return endTime > bStart && startTime < bEnd;
        });

        return {
            available: conflicts.length === 0,
            conflicts: conflicts.length > 0 ? conflicts : undefined
        };
    }

    async validateBooking(bookingData: Partial<Booking>): Promise<string[]> {
        const errors: string[] = [];

        if (!bookingData.title?.trim()) {
            errors.push('Title is required');
        }

        if (!bookingData.roomId) {
            errors.push('Room is required');
        }

        if (!bookingData.employeeId) {
            errors.push('Organizer is required');
        }

        if (!bookingData.startTime || !bookingData.endTime) {
            errors.push('Start and end times are required');
        } else {
            const start = new Date(bookingData.startTime);
            const end = new Date(bookingData.endTime);

            if (start >= end) {
                errors.push('End time must be after start time');
            }

            if (start < new Date()) {
                errors.push('Cannot book in the past');
            }

            const duration = (end.getTime() - start.getTime()) / (1000 * 60);
            if (duration < 15) {
                errors.push('Meeting must be at least 15 minutes long');
            }
            if (duration > 480) {
                errors.push('Meeting cannot exceed 8 hours');
            }
        }

        if (bookingData.attendees && bookingData.attendees.length > 20) {
            errors.push('Maximum 20 attendees allowed');
        }

        return errors;
    }

    async createBooking(
        bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>
    ): Promise<Booking> {
        const errors = await this.validateBooking(bookingData);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        const room = await this.roomRepo.findById(bookingData.roomId);
        if (!room) {
            throw new Error('Room not found');
        }

        const availability = await this.checkAvailability(
            bookingData.roomId,
            new Date(bookingData.startTime),
            new Date(bookingData.endTime)
        );

        if (!availability.available) {
            throw new Error('Room is not available for the selected time slot');
        }

        const now = new Date().toISOString();
        return this.bookingRepo.create({
            ...bookingData,
            status: BookingStatus.CONFIRMED,
            createdAt: now,
            updatedAt: now
        });
    }

    async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
        const existing = await this.bookingRepo.findById(id);
        if (!existing) {
            throw new Error('Booking not found');
        }

        if (new Date(existing.startTime) < new Date()) {
            throw new Error('Cannot edit past bookings');
        }

        if (data.startTime && data.endTime) {
            const availability = await this.checkAvailability(
                existing.roomId,
                new Date(data.startTime),
                new Date(data.endTime),
                id
            );

            if (!availability.available) {
                throw new Error('Room is not available for the selected time slot');
            }
        }

        return this.bookingRepo.update(id, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    }

    async cancelBooking(id: string): Promise<void> {
        const existing = await this.bookingRepo.findById(id);
        if (!existing) {
            throw new Error('Booking not found');
        }

        if (new Date(existing.startTime) < new Date()) {
            throw new Error('Cannot cancel past bookings');
        }

        await this.bookingRepo.update(id, {
            status: BookingStatus.CANCELLED,
            updatedAt: new Date().toISOString()
        });
    }
}