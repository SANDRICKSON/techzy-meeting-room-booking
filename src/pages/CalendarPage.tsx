import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    IconButton,
    Button,
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Today,
} from '@mui/icons-material';
import CalendarView from '../components/calendar/CalendarView';
import { useCalendar } from '../hooks/useCalendar';
import { useBookingStore } from '../stores/bookingStore';
import BookingDetails from '../components/bookings/BookingDetails';
import { Booking } from '../domain/entities/Booking';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const CalendarPage: React.FC = () => {
    const { fetchBookings, loading } = useBookingStore();
    const {
        view,
        setView,
        formattedDate,
        navigate,
        goToToday,
        isToday,
    } = useCalendar();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    if (loading) {
        return <LoadingSpinner message="Loading calendar..." />;
    }

    return (
        <Container maxWidth="xl">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h4">
                    Calendar
                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        component="span"
                        sx={{ ml: 2 }}
                    >
                        {formattedDate}
                    </Typography>
                </Typography>

                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <ToggleButtonGroup
                        value={view}
                        exclusive
                        onChange={(_, val) => val && setView(val)}
                        size="small"
                    >
                        <ToggleButton value="day">Day</ToggleButton>
                        <ToggleButton value="week">Week</ToggleButton>
                    </ToggleButtonGroup>

                    <Box display="flex" alignItems="center" gap={1}>
                        <IconButton onClick={() => navigate('prev')} aria-label="Previous">
                            <ChevronLeft />
                        </IconButton>
                        <Button
                            variant={isToday ? 'contained' : 'outlined'}
                            size="small"
                            onClick={goToToday}
                            startIcon={<Today />}
                        >
                            Today
                        </Button>
                        <IconButton onClick={() => navigate('next')} aria-label="Next">
                            <ChevronRight />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            <CalendarView onBookingClick={setSelectedBooking} />

            {selectedBooking && (
                <BookingDetails
                    booking={selectedBooking}
                    open={!!selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </Container>
    );
};

export default CalendarPage;