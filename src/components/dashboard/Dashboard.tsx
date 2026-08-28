import React, { useEffect } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useRoomStore } from '../../stores/roomStore';
import { useBookingStore } from '../../stores/bookingStore';
import UpcomingBookings from './UpcomingBookings';
import StatsCards from "./StatsCard";

const Dashboard: React.FC = () => {
    const { rooms, fetchRooms } = useRoomStore();
    const { bookings, fetchBookings } = useBookingStore();

    useEffect(() => {
        fetchRooms();
        fetchBookings();
    }, []);

    const today = new Date();
    const todayBookings = bookings.filter(b => {
        const bDate = new Date(b.startTime);
        return bDate.toDateString() === today.toDateString() && b.status !== 'cancelled';
    });

    const upcomingBookings = bookings
        .filter(b => {
            const bDate = new Date(b.startTime);
            return bDate > today && b.status !== 'cancelled';
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 10);

    const activeRooms = rooms.filter(r => r.isActive);
    const occupiedRooms = activeRooms.filter(room =>
        todayBookings.some(b => b.roomId === room.id)
    );

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <StatsCards
                        totalRooms={activeRooms.length}
                        availableRooms={activeRooms.length - occupiedRooms.length}
                        todayBookings={todayBookings.length}
                        totalBookings={bookings.filter(b => b.status !== 'cancelled').length}
                    />
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Today's Schedule
                        </Typography>
                        {todayBookings.length === 0 ? (
                            <Typography color="text.secondary">
                                No meetings scheduled for today
                            </Typography>
                        ) : (
                            <UpcomingBookings bookings={todayBookings} />
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Quick Stats
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                • {activeRooms.length} total rooms
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • {occupiedRooms.length} rooms occupied today
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • {activeRooms.length - occupiedRooms.length} rooms available
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • {upcomingBookings.length} upcoming bookings
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {upcomingBookings.length > 0 && (
                <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Upcoming Bookings
                    </Typography>
                    <UpcomingBookings bookings={upcomingBookings} />
                </Paper>
            )}
        </Box>
    );
};

export default Dashboard;