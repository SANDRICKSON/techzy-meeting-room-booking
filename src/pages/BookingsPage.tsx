import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useBookingStore } from '../stores/bookingStore';
import BookingForm from "../components/bookings/BookingForm.tsx";
import BookingsList from "../components/bookings/BookingList.tsx";

const BookingsPage: React.FC = () => {
    const [formOpen, setFormOpen] = useState(false);
    const { fetchBookings } = useBookingStore();

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Bookings</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setFormOpen(true)}
                >
                    New Booking
                </Button>
            </Box>

            <BookingsList />

            <BookingForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
            />
        </Container>
    );
};

export default BookingsPage;