export enum BookingStatus {
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed'
}

export interface Booking {
    id: string;
    roomId: string;
    employeeId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    attendees: string[];
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
    requiresEquipment?: string[];
    notes?: string;
}