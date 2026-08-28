import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Tooltip,
} from '@mui/material';
import { format, isToday, getHours } from 'date-fns';
import { Booking, BookingStatus } from '../../domain/entities/Booking';
import { Room } from '../../domain/entities/Room';

interface DayViewProps {
    date: Date;
    bookings: Booking[];
    rooms: Room[];
    onBookingClick: (booking: Booking) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

const DayView: React.FC<DayViewProps> = ({
                                             date,
                                             bookings,
                                             rooms,
                                             onBookingClick,
                                         }) => {
    const getBookingsForHour = (hour: number) => {
        return bookings.filter((booking) => {
            const start = new Date(booking.startTime);
            return getHours(start) === hour;
        });
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                {format(date, 'EEEE, MMMM d, yyyy')}
                {isToday(date) && (
                    <Chip label="Today" color="primary" size="small" sx={{ ml: 2 }} />
                )}
            </Typography>

            <Box sx={{ mt: 2 }}>
                {HOURS.map((hour) => {
                    const hourBookings = getBookingsForHour(hour);

                    return (
                        <Box
                            key={hour}
                            sx={{
                                display: 'flex',
                                borderBottom: 1,
                                borderColor: 'divider',
                                minHeight: 60,
                                py: 1,
                            }}
                        >
                            <Box sx={{ width: 80, flexShrink: 0 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {format(new Date().setHours(hour), 'h a')}
                                </Typography>
                            </Box>

                            <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {hourBookings.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                        No bookings
                                    </Typography>
                                ) : (
                                    hourBookings.map((booking) => {
                                        const room = rooms.find((r) => r.id === booking.roomId);
                                        return (
                                            <Tooltip key={booking.id} title={booking.title}>
                                                <Box
                                                    sx={{
                                                        bgcolor: booking.status === BookingStatus.CONFIRMED ? 'primary.light' : 'error.light',
                                                        borderRadius: 1,
                                                        p: 1,
                                                        cursor: 'pointer',
                                                        minWidth: 150,
                                                        '&:hover': {
                                                            bgcolor: booking.status === BookingStatus.CONFIRMED ? 'primary.main' : 'error.main',
                                                            color: 'white',
                                                        },
                                                    }}
                                                    onClick={() => onBookingClick(booking)}
                                                >
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {booking.title}
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        {room?.name || 'Unknown Room'}
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        {format(new Date(booking.startTime), 'h:mm a')} -
                                                        {format(new Date(booking.endTime), 'h:mm a')}
                                                    </Typography>
                                                    {booking.status === BookingStatus.CANCELLED && (
                                                        <Chip label="Cancelled" size="small" color="error" sx={{ mt: 0.5 }} />
                                                    )}
                                                </Box>
                                            </Tooltip>
                                        );
                                    })
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
};

export default DayView;