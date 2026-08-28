// src/pages/RoomsPage.tsx
import React, { useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import RoomsList from '../components/rooms/RoomsList';
import { useRoomStore } from '../stores/roomStore';

const RoomsPage: React.FC = () => {
    const { fetchRooms } = useRoomStore();

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <Container maxWidth="lg">
            <Box mb={3}>
                <Typography variant="h4" gutterBottom>
                    Meeting Rooms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Browse and book available meeting rooms
                </Typography>
            </Box>
            <RoomsList />
        </Container>
    );
};

export default RoomsPage;