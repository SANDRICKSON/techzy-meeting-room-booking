import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useCalendar } from '../../hooks/useCalendar';
import { useRoomStore } from '../../stores/roomStore';
import WeekView from './WeekView';
import DayView from './DayView';
import { Booking,  } from '../../domain/entities/Booking';

interface CalendarViewProps {
    onBookingClick: (booking: Booking) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onBookingClick }) => {
    const { view, days, getBookingsForDay } = useCalendar();
    const { rooms } = useRoomStore();

    if (rooms.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                    No rooms available
                </Typography>
            </Box>
        );
    }


    const hasBookings = days.some(day => getBookingsForDay(day).length > 0);

    return (
        <Box>
            {!hasBookings && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    No bookings scheduled for this period.
                </Alert>
            )}

            {view === 'day' ? (
                <DayView
                    date={days[0]}
                    bookings={getBookingsForDay(days[0])}
                    rooms={rooms}
                    onBookingClick={onBookingClick}
                />
            ) : (
                <WeekView
                    days={days}
                    getBookingsForDay={getBookingsForDay}
                    onBookingClick={onBookingClick}
                />
            )}
        </Box>
    );
};

export default CalendarView;